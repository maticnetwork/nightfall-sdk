import path from "path";
import {
  CONTRACT_SHIELD,
  TX_FEE_ETH_WEI_DEFAULT,
  TX_FEE_MATIC_WEI_DEFAULT,
} from "./constants";
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

    // Get the Eth account address from private key if it's a valid key
    const ethAddress = getEthAccountAddress(ethPrivateKey, web3Websocket.web3);

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

  /**
   *  Allow to check the status of the User running
   *
   * @async
   * @method checkStatus
   * @returns {Object}
   */
  async checkStatus() {
    logger.debug("User :: checkStatus");
    const isWeb3WsAlive = !!(await this.web3Websocket.setEthBlockNo());
    const isClientAlive = await this.client.healthCheck();
    return { isWeb3WsAlive, isClientAlive };
  }

  /**
   * Allow user to retrieve the Nightfall Mnemonic  - Keep this private
   *
   * @method getNightfallMnemonic
   * @return {String} Nightfall mnemonic
   */
  getNightfallMnemonic(): string {
    return this.nightfallMnemonic;
  }

  /**
   * Allow user to retrieve Nightfall Layer2 address
   *
   * @method getNightfallAddress
   * @returns {String} Nightfall Layer2 address
   */
  getNightfallAddress(): string {
    return this.zkpKeys?.compressedZkpPublicKey;
  }

  /**
   * Allow user to make an ERC20 deposit to Nightfall
   *
   * @async
   * @method makeDeposit
   * @param {UserMakeDeposit} options
   * @param {String} options.tokenAddress
   * @param {String} options.tokenStandard
   * @param {String} options.value
   * @param {String} [options.feeWei]
   * @returns {Object}
   */
  async makeDeposit(options: UserMakeDeposit) {
    logger.debug({ options }, "User :: makeDeposit");

    makeDepositOptions.validate(options);

    // Format options
    const value = options.value.trim();
    const feeWei = options.feeWei?.trim() || TX_FEE_ETH_WEI_DEFAULT;
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
    logger.info({ valueWei, feeWei }, "Value and fee in Wei");

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
   * Allow user to transfer tokens in Nightfall to other Nightfall users
   *
   * @async
   * @method makeTransfer
   * @param {UserMakeTransfer} options
   * @param {String} options.tokenAddress
   * @param {String} options.tokenStandard
   * @param {String} options.value
   * @param {String} [options.feeWei]
   * @param {String} options.nightfallRecipientAddress
   * @param {Boolean} [options.isOffChain]
   * @returns {Promise}
   */
  async makeTransfer(options: UserMakeTransfer): Promise<TransferReceipts> {
    logger.debug(options, "User :: makeTransfer");

    makeTransferOptions.validate(options);

    // Format options
    const value = options.value.trim();
    const feeWei = options.feeWei?.trim() || TX_FEE_MATIC_WEI_DEFAULT;
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
    logger.info({ valueWei, feeWei }, "Value and fee in Wei");

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

  /**
   * Allow user to request a withdrawal from Layer2
   *
   * @async
   * @method makeWithdrawal
   * @param {UserMakeWithdrawal} options
   * @param {String} options.tokenAddress
   * @param {String} options.tokenStandard
   * @param {String} options.value
   * @param {String} [options.feeWei]
   * @param {String} options.ethRecipientAddress
   * @param {Boolean} [options.isOffChain]
   * @returns {Object}
   */
  async makeWithdrawal(options: UserMakeWithdrawal) {
    logger.debug({ options }, "User :: makeWithdrawal");

    makeWithdrawalOptions.validate(options);

    // Format options
    const value = options.value.trim();
    const feeWei = options.feeWei?.trim() || TX_FEE_MATIC_WEI_DEFAULT;
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
    logger.info({ valueWei, feeWei }, "Value and fee in Wei");

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

  /**
   * Allow user to finalise a previously initiated withdrawal and withdraw funds back to Layer1
   *
   * @async
   * @method finaliseWithdrawal
   * @param {UserFinaliseWithdrawal} options
   * @param {String} options.withdrawTxHash
   * @returns {TransactionReceipt}
   */
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

  /**
   * Allow user to check the deposits that haven't been processed yet
   *
   * @async
   * @method checkPendingDeposits
   * @returns {Promise} - This promise resolves into an object containing the aggregated value per token, for deposit transactions that have not been included yet in a Layer2 block
   */
  async checkPendingDeposits() {
    return this.client.getPendingDeposits(this.zkpKeys);
  }

  /**
   * Allow user to get the total Nightfall Layer2 balance of its commitements
   *
   * @async
   * @method checkNightfallBalances
   * @returns {Promise} - This promise resolves into an object containing the aggregated value per token, for commitments available in Layer2
   */
  async checkNightfallBalances() {
    return this.client.getNightfallBalances(this.zkpKeys);
  }

  /**
   * Allow user to check the balance of the pending spent commitments on Layer2
   *
   * @async
   * @method checkPendingTransfers
   * @returns {Promise}  - This promise resolves into an object whose properties are the
    addresses of the ERC contracts of the tokens held by this account in Layer 2. The
    value of each propery is the number of tokens pending spent (transfer & withdraw)
    from that contract. 
   */
  async checkPendingTransfers() {
    return this.client.getPendingTransfers(this.zkpKeys);
  }

  /**
   * Allow user to export the commitments
   *
   * @async
   * @method exportCommitments
   * @param {UserExportCommitments} options
   * @param {String[]} options.listOfCompressedZkpPublicKey
   * @param {String} options.pathToExport
   * @param {String} options.fileName
   * @returns {Promise}
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
   * @returns the enpoint response.data that is an json with a success message.
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

    const response = await this.client.saveCommitments(listOfCommitments);

    if (!response) {
      logger.error(
        "All commitments of this list already exists in the database!",
      );
      throw new Error(
        "All commitments of this list already exists in the database!",
      );
    }

    logger.info(response.data);
    return response.data;
  }

  close() {
    logger.debug("User :: close");
    this.web3Websocket.close();
  }
}

export default UserFactory;
