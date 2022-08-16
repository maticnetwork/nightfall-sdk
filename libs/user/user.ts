import path from "path";
import { CONTRACT_SHIELD, TX_FEE_GWEI_DEFAULT } from "./constants";
import {
  UserFactoryCreate,
  UserConstructor,
  UserMakeDeposit,
  UserMakeTransfer,
  UserMakeWithdrawal,
  UserFinaliseWithdrawal,
  UserExportCommitments,
  TransferReceipts,
} from "./types";
import { Client } from "../client";
import { Web3Websocket, getEthAccountAddress } from "../ethereum";
import { createZkpKeysAndSubscribeToIncomingKeys } from "../nightfall";
import {
  createAndSubmitApproval,
  createAndSubmitDeposit,
  createAndSubmitTransfer,
  createAndSubmitWithdrawal,
  createAndSubmitFinaliseWithdrawal,
  stringValueToWei,
} from "../transactions";
import { parentLogger } from "../utils";
import {
  createOptions,
  makeDepositOptions,
  makeTransferOptions,
  makeWithdrawalOptions,
  finaliseWithdrawalOptions,
} from "./validations";
import type { NightfallZkpKeys } from "../nightfall/types";
import { TokenFactory } from "../tokens";
import convertObjectToString from "../utils/convertObjectToString";
import exportFile from "../utils/exportFile";
import { Commitment } from "../types";
import readAndValidateFile from "../utils/readAndValidateFile";
import isCommitmentsFromMnemonic from "../utils/isCommitmentFromMnemonic";
import { ERROR_COMMITMENT_NOT_MATCH_MNEMONIC } from "../messages/commitments";
import isCommitmentType from "libs/utils/isCommitmentType";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

class UserFactory {
  static async create(options: UserFactoryCreate) {
    logger.debug("UserFactory :: create");
    createOptions.validate(options);

    // Format options
    const clientApiUrl = options.clientApiUrl.trim().toLowerCase();
    const blockchainWsUrl = options.blockchainWsUrl.trim().toLowerCase();
    const ethPrivateKey = options.ethereumPrivateKey.trim();
    const nightfallMnemonic = options.nightfallMnemonic?.trim(); // else keep as undefined

    // Instantiate Client and Web3Websocket
    const client = new Client(clientApiUrl);
    const web3Websocket = new Web3Websocket(blockchainWsUrl);

    // Get Shield contract address
    const shieldContractAddress = await client.getContractAddress(
      CONTRACT_SHIELD,
    );
    if (!shieldContractAddress)
      throw new Error("Unable to get Shield contract address");

    // Get the Eth account address from private key if it's a valid key
    const ethAddress = getEthAccountAddress(ethPrivateKey, web3Websocket.web3);
    if (!ethAddress) throw new Error("Unable to get an Eth address");

    // Create a set of Zero-knowledge proof keys from a valid mnemonic
    // or from a new mnemonic if none was provided,
    // subscribe to incoming viewing keys
    const nightfallKeys = await createZkpKeysAndSubscribeToIncomingKeys(
      nightfallMnemonic,
      client,
    );
    if (!nightfallKeys) throw new Error("Unable to generate Nightfall keys");

    return new User({
      client,
      web3Websocket,
      shieldContractAddress,
      ethPrivateKey: ethPrivateKey,
      ethAddress,
      nightfallMnemonic: nightfallKeys.nightfallMnemonic,
      zkpKeys: nightfallKeys.zkpKeys,
    });
  }
}

class User {
  // Set by constructor
  client: Client;
  web3Websocket: Web3Websocket;
  shieldContractAddress: string;
  ethPrivateKey: string;
  ethAddress: string;
  nightfallMnemonic: string;
  zkpKeys: NightfallZkpKeys;

  // Set when transacting
  token: any;
  nightfallDepositTxHashes: string[] = [];
  nightfallWithdrawalTxHashes: string[] = [];

  constructor(options: UserConstructor) {
    logger.debug("new User");

    let key: keyof UserConstructor;
    for (key in options) {
      this[key] = options[key];
    }
  }

  async checkStatus() {
    logger.debug("User :: checkStatus");
    const isWeb3WsAlive = !!(await this.web3Websocket.setEthBlockNo());
    const isClientAlive = await this.client.healthCheck();
    return { isWeb3WsAlive, isClientAlive };
  }

  async makeDeposit(options: UserMakeDeposit) {
    logger.debug({ options }, "User :: makeDeposit");

    makeDepositOptions.validate(options);

    // Format options
    const value = options.value.trim();
    const feeGwei = options.feeGwei?.trim() || TX_FEE_GWEI_DEFAULT;
    const tokenAddress = options.tokenAddress.trim();
    const tokenStandard = options.tokenStandard.trim().toUpperCase();

    // Set token only if it's not set or is different
    if (!this.token || tokenAddress !== this.token.contractAddress) {
      this.token = await TokenFactory.create({
        address: tokenAddress,
        ercStandard: tokenStandard,
        web3: this.web3Websocket.web3,
      });
    }
    if (this.token === null) throw new Error("Unable to set token");

    // Convert value and fee to wei
    const valueWei = stringValueToWei(value, this.token.decimals);
    const feeWei = feeGwei + "000000000";
    logger.info({ valueWei, feeWei }, "Value and fee in wei");

    // Deposit tx might need approval
    const approvalReceipt = await createAndSubmitApproval(
      this.token,
      this.ethAddress,
      this.ethPrivateKey,
      this.shieldContractAddress,
      this.web3Websocket.web3,
      valueWei,
    );
    if (approvalReceipt === null) return null;
    logger.info({ approvalReceipt }, "Approval completed");

    // Deposit
    const depositReceipts = await createAndSubmitDeposit(
      this.token,
      this.ethAddress,
      this.ethPrivateKey,
      this.zkpKeys,
      this.shieldContractAddress,
      this.web3Websocket.web3,
      this.client,
      valueWei,
      feeWei,
    );
    if (depositReceipts === null) return null;
    logger.info({ depositReceipts }, "Deposit completed");

    this.nightfallDepositTxHashes.push(depositReceipts.txL2?.transactionHash);

    return depositReceipts;
  }

  /**
   * Allow user to transfer tokens in Polygon Nightfall
   *
   * @async
   * @method makeTransfer
   * @param {UserMakeTransfer} options Object containing necessary data to perform transfers
   * @returns // TODO
   */
  async makeTransfer(options: UserMakeTransfer): Promise<TransferReceipts> {
    logger.debug(options, "User :: makeTransfer");

    makeTransferOptions.validate(options);

    // Format options
    const value = options.value.trim();
    const feeGwei = options.feeGwei?.trim() || TX_FEE_GWEI_DEFAULT;
    const tokenAddress = options.tokenAddress.trim();
    const tokenStandard = options.tokenStandard.trim().toUpperCase();
    const nightfallRecipientAddress = options.nightfallRecipientAddress.trim();
    const isOffChain = options.isOffChain || false;

    // Set token only if it's not set or is different
    if (!this.token || tokenAddress !== this.token.contractAddress) {
      this.token = await TokenFactory.create({
        address: tokenAddress,
        ercStandard: tokenStandard,
        web3: this.web3Websocket.web3,
      });
    }
    if (this.token === null) throw new Error("Unable to set token");

    // Convert value and fee to wei
    const valueWei = stringValueToWei(value, this.token.decimals);
    const feeWei = feeGwei + "000000000";
    logger.info({ valueWei, feeWei }, "Value and fee in wei");

    const transferReceipts = await createAndSubmitTransfer(
      this.token,
      this.ethAddress,
      this.ethPrivateKey,
      this.zkpKeys,
      this.shieldContractAddress,
      this.web3Websocket.web3,
      this.client,
      valueWei,
      feeWei,
      nightfallRecipientAddress,
      isOffChain,
    );

    if (transferReceipts === null) {
      logger.error({ transferReceipts }, "Transfer was not completed!");
      return null;
    }

    logger.info({ transferReceipts }, "Transfer was completed!");
    return transferReceipts;
  }

  async makeWithdrawal(options: UserMakeWithdrawal) {
    logger.debug({ options }, "User :: makeWithdrawal");

    makeWithdrawalOptions.validate(options);

    // Format options
    const value = options.value.trim();
    const feeGwei = options.feeGwei?.trim() || TX_FEE_GWEI_DEFAULT;
    const tokenAddress = options.tokenAddress.trim();
    const tokenStandard = options.tokenStandard.trim().toUpperCase();
    const ethRecipientAddress = options.ethRecipientAddress.trim();
    const isOffChain = options.isOffChain || false;

    // Set token only if it's not set or is different
    if (!this.token || tokenAddress !== this.token.contractAddress) {
      this.token = await TokenFactory.create({
        address: tokenAddress,
        ercStandard: tokenStandard,
        web3: this.web3Websocket.web3,
      });
    }
    if (this.token === null) throw new Error("Unable to set token");

    // Convert value and fee to wei
    const valueWei = stringValueToWei(value, this.token.decimals);
    const feeWei = feeGwei + "000000000";
    logger.info({ valueWei, feeWei }, "Value and fee in wei");

    // Withdrawal
    const withdrawalReceipts = await createAndSubmitWithdrawal(
      this.token,
      this.ethAddress,
      this.ethPrivateKey,
      this.zkpKeys,
      this.shieldContractAddress,
      this.web3Websocket.web3,
      this.client,
      valueWei,
      feeWei,
      ethRecipientAddress,
      isOffChain,
    );

    if (withdrawalReceipts === null) return null;
    logger.info({ withdrawalReceipts }, "Withdrawal completed");

    this.nightfallWithdrawalTxHashes.push(
      withdrawalReceipts.txL2?.transactionHash,
    );

    return withdrawalReceipts;
  }

  async finaliseWithdrawal(options: UserFinaliseWithdrawal) {
    logger.debug({ options }, "User :: finaliseWithdrawal");
    finaliseWithdrawalOptions.validate(options);

    // If no withdrawTxHash was given, use the latest
    const withdrawTxHash =
      options.withdrawTxHash?.trim() ||
      this.nightfallWithdrawalTxHashes[
        this.nightfallWithdrawalTxHashes.length - 1
      ];
    if (!withdrawTxHash)
      throw new Error("Could not find any withdrawal tx hash");

    logger.info({ withdrawTxHash }, "Finalise withdrawal with tx hash");

    return createAndSubmitFinaliseWithdrawal(
      this.ethAddress,
      this.ethPrivateKey,
      this.shieldContractAddress,
      this.web3Websocket.web3,
      this.client,
      withdrawTxHash,
    );
  }

  async checkPendingDeposits() {
    return this.client.getPendingDeposits(this.zkpKeys);
  }

  async checkNightfallBalances() {
    return this.client.getNightfallBalances(this.zkpKeys);
  }

  /**
   *
   * @method checkLayer2PendingSpentBalances should get return the balance of pending spent commitments
   * from transfer and withdraw for each ERC address
   * @param {string[]} ercList - an array of ERC smart contracts
   * @param {boolean} shouldFilterByCompressedZkpPublicKey - a boolean value that will define in the endpoint if the query
   * @returns
   */
  async checkPendingTransfers() {
    return this.client.getPendingTransfers(this.zkpKeys);
  }

  /**
   *
   * @method exportCommitments get the commitments from the client instance and
   * export a file with this commitments to some path based in the env variables
   * that set the path and the filename.
   * @param listOfCompressedZkpPublicKey a list of compressed zkp public key derivated
   * from the user mnemonic.
   * @param pathToExport the path to export the file.
   * @param fileName the name of the file.
   */
  async exportCommitments(
    options: UserExportCommitments,
  ): Promise<void | null> {
    try {
      const allCommitmentsByCompressedZkpPublicKey: Commitment[] =
        await this.client.getCommitmentsByCompressedZkpPublicKey(
          options.listOfCompressedZkpPublicKey,
        );

      if (
        allCommitmentsByCompressedZkpPublicKey &&
        allCommitmentsByCompressedZkpPublicKey.length > 0
      ) {
        await exportFile(
          `${options.pathToExport}${options.fileName}`,
          convertObjectToString(allCommitmentsByCompressedZkpPublicKey),
        );
        return;
      }
      logger.warn(
        "Either you don't have any commitments for this listOfCompressedZkpPublicKey or this one is invalid!",
      );
      return null;
    } catch (err) {
      logger.child({ options }).error(err);
      return null;
    }
  }

  /**
   *
   * @async
   * @method importAndSaveCommitments should coverage the import commitments flow.
   * - Should read and validate a file with commitments.
   * - Verify if all the commitments read are of the ICommitment type (This verification is within readAndValidateFile function).
   * - Verify if all the commitments belongs to the user compressedZkpPublicKey.
   * - If all verifications pass, should send the commitments to the client to be saved
   *  in the database.
   * @param pathToExport the path to export the file.
   * @param fileName the name of the file.
   * @param compressedZkpPublicKey the key derivated from user mnemonic.
   * @returns true if everything goes well.
   */
  async importAndSaveCommitments(
    pathToExport: string,
    fileName: string,
    compressedZkpPublicKey: string,
  ) {
    const listOfCommitments: Commitment[] | Error = await readAndValidateFile(
      `${pathToExport}${fileName}`,
    );

    if (listOfCommitments instanceof Error) {
      logger.error(listOfCommitments);
      throw listOfCommitments;
    }

    const isCommitmentsFromMnemonicReturn = await isCommitmentsFromMnemonic(
      listOfCommitments,
      compressedZkpPublicKey,
    );

    if (!isCommitmentsFromMnemonicReturn) {
      logger.error(ERROR_COMMITMENT_NOT_MATCH_MNEMONIC);
      throw new Error(ERROR_COMMITMENT_NOT_MATCH_MNEMONIC);
    }

    this.client.saveCommitments(listOfCommitments);

    return true;
  }

  close() {
    logger.debug("User :: close");
    this.web3Websocket.close();
  }
}

export default UserFactory;
