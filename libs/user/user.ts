import path from "path";
import { CONTRACT_SHIELD, TX_FEE_GWEI_DEFAULT } from "./constants";
import {
  UserFactoryOptions,
  UserOptions,
  UserMakeDepositOptions,
  UserExportCommitments,
  TransferReceipts,
  UserMakeTransfer,
} from "./types";
import { Client } from "../client";
import { Web3Websocket, getEthAccountAddress } from "../ethereum";
import { createZkpKeysAndSubscribeToIncomingKeys } from "../nightfall";
import {
  createAndSubmitApproval,
  createAndSubmitDeposit,
  stringValueToWei,
  createAndSubmitTransfer,
} from "../transactions";
import { parentLogger } from "../utils";
import { createOptions, makeTransferOptions } from "./validations";
import type { NightfallZkpKeys } from "../nightfall/types";
import { TokenFactory } from "../tokens";
import convertObjectToString from "../utils/convertObjectToString";
import exportFile from "../utils/exportFile";
import { Commitment } from "../../libs/types";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

class UserFactory {
  static async create(options: UserFactoryOptions) {
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
  nightfallTxHashes: string[] = [];

  constructor(options: UserOptions) {
    logger.debug("new User");

    let key: keyof UserOptions;
    for (key in options) {
      this[key] = options[key];
    }
  }

  async makeDeposit(options: UserMakeDepositOptions) {
    logger.debug({ options }, "User :: makeDeposit");

    // Format options
    let value = options.value.trim();
    let fee = options.feeGwei?.trim() || TX_FEE_GWEI_DEFAULT;
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
    value = stringValueToWei(value, this.token.decimals);
    fee = fee + "000000000";
    logger.info({ value, fee }, "Value and fee in wei");

    // Deposit tx might need approval
    const approvalReceipt = await createAndSubmitApproval(
      this.token,
      this.ethAddress,
      this.ethPrivateKey,
      this.shieldContractAddress,
      value,
      "0",
      this.web3Websocket.web3,
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
      value,
      fee,
      this.web3Websocket.web3,
      this.client,
    );
    if (depositReceipts === null) return null;
    logger.info({ depositReceipts }, "Deposit completed");

    this.nightfallTxHashes.push(depositReceipts.txL2?.transactionHash);

    return depositReceipts;
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
  async checkLayer2PendingSpentBalances(
    ercList: string[],
    shouldFilterByCompressedZkpPublicKey: boolean,
  ) {
    return this.client.getLayer2PendingSpentBalances(
      ercList,
      shouldFilterByCompressedZkpPublicKey,
      this.zkpKeys,
    );
  }

  /**
   *
   * @method makeTransfer allow user to make a transfer in polygon nightfall network.
   * @async
   * @param {string} tokenAddress - the address of the smart contract for the ercStandard
   * @param {string} tokenStandard - the ercStandard
   * @param {string} value - the amount to be transfered
   * @param {string} recipientAddress - the compressedZkpPublicKey for the receiver
   * @param {string} feeGwei - The amount (GWei) to pay a proposer for the transaction
   * is being taken.  Note that the Nightfall_3 State.sol contract must be approved
   * by the token's owner to be able to withdraw the token.
   * @returns Promise<TransferReceipts>
   * @author luizoamorim
   */
  async makeTransfer(options: UserMakeTransfer): Promise<TransferReceipts> {
    logger.debug(options, "User :: makeTransfer");

    // Validate the parameters
    makeTransferOptions.validate(options);

    // Format the parameters
    const valueFormated = options.value.trim();
    const feeGweiFormated = options.feeGwei?.trim() || TX_FEE_GWEI_DEFAULT;
    const tokenAddressFormated = options.tokenAddress.trim();
    const tokenStandardFormated = options.tokenStandard.trim().toUpperCase();
    const recipientAddressFormated = options.recipientAddress.trim();
    const isOffChain = options.isOffChain || false;

    // Set token only if it's not set or is different
    if (!this.token || tokenAddressFormated !== this.token.contractAddress) {
      this.token = await TokenFactory.create({
        address: tokenAddressFormated,
        ercStandard: tokenStandardFormated,
        web3: this.web3Websocket.web3,
      });
    }

    if (this.token === null) throw new Error("Unable to set token");

    // Convert values fron GWei to Wei
    const valueWeiFormat = stringValueToWei(valueFormated, this.token.decimals);
    const feeWeiFormat = feeGweiFormated + "000000000";
    logger.info({ valueWeiFormat, feeWeiFormat }, "Value and fee in wei");

    const transferReceipts = await createAndSubmitTransfer(
      this.token.contractAddress,
      this.token.ercStandard,
      this.ethAddress,
      this.ethPrivateKey,
      this.zkpKeys,
      this.shieldContractAddress,
      valueWeiFormat,
      feeWeiFormat,
      this.web3Websocket.web3,
      this.client,
      recipientAddressFormated,
      isOffChain,
    );

    if (transferReceipts === null) {
      logger.error({ transferReceipts }, "Transfer was not completed!");
      return null;
    }

    logger.info({ transferReceipts }, "Transfer was completed!");
    return transferReceipts;
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
   * @author luizoamorim
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
   * @function importAndSaveCommitments should coverage the import commitments flow.
   * - Should import a file with commitments.
   * - Verify if all the commitments in the list of imported commitments are of the
   * ICommitment type (This verification is within importCommitments function).
   * - Verify if all the commitments belongs to the user compressedZkpPublicKey.
   * - If all verifications pass, should send the commitments to the client to be saved
   *  in the database.
   * @param pathToExport the path to export the file.
   * @param fileName the name of the file.
   * @param compressedZkpPublicKey the key derivated from user mnemonic.
   * @author luizoamorim
   */
  async importAndSaveCommitments(
    pathToExport: string,
    fileName: string,
    compressedZkpPublicKey: string,
  ) {
    const listOfCommitments: ICommitments[] | Error = await importCommitments(
      `${pathToExport}${fileName}`,
    );

    if (listOfCommitments instanceof Error) {
      logger.error(listOfCommitments);
      return;
    }

    const isCommitmentsFromMnemonicReturn = await isCommitmentsFromMnemonic(
      listOfCommitments,
      compressedZkpPublicKey,
    );

    if (!isCommitmentsFromMnemonicReturn) {
      logger.error(ERROR_COMMITMENT_NOT_MATCH_MNEMONIC);
      return;
    }

    this.client.saveCommitments(listOfCommitments);
  }

  close() {
    logger.debug("User :: close");
    this.web3Websocket.close();
  }

  async checkStatus() {
    logger.debug("User :: checkStatus");
    const isWeb3WsAlive = !!(await this.web3Websocket.setEthBlockNo());
    const isClientAlive = await this.client.healthCheck();
    return { isWeb3WsAlive, isClientAlive };
  }

  close() {
    logger.debug("User :: close");
    this.web3Websocket.close();
  }
}

export default UserFactory;
