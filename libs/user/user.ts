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
  UserCheckBalances,
  UserExportCommitments,
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
  checkBalancesOptions,
} from "./validations";
import type { NightfallZkpKeys } from "../nightfall/types";
import { TokenFactory } from "../tokens";
import convertObjectToString from "../utils/convertObjectToString";
import exportFile from "../utils/exportFile";
import type { Commitment } from "../nightfall/types";
import {
  OffChainTransactionReceipt,
  OnChainTransactionReceipts,
} from "../transactions/types";
import { NightfallSdkError } from "../utils/error";
import type { TransactionReceipt } from "web3-core";

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
  nightfallTransferTxHashes: string[] = [];
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
   * @returns {Promise<>}
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
   * @returns {String} Nightfall mnemonic
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
   * @param {String} options.tokenContractAddress
   * @param {String} options.tokenErcStandard
   * @param {String} options.value
   * @param {String} [options.feeWei]
   * @returns {Promise<OnChainTransactionReceipts>}
   */
  async makeDeposit(
    options: UserMakeDeposit,
  ): Promise<OnChainTransactionReceipts> {
    logger.debug({ options }, "User :: makeDeposit");

    makeDepositOptions.validate(options);

    // Format options
    const value = options.value.trim();
    const feeWei = options.feeWei?.trim() || TX_FEE_ETH_WEI_DEFAULT;
    const tokenContractAddress = options.tokenContractAddress.trim();
    const tokenErcStandard = options.tokenErcStandard.trim().toUpperCase();

    // Set token only if it's not set or is different
    if (!this.token || tokenContractAddress !== this.token.contractAddress) {
      this.token = await TokenFactory.create({
        contractAddress: tokenContractAddress,
        ercStandard: tokenErcStandard,
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
    if (approvalReceipt) logger.info({ approvalReceipt }, "Approval completed");

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
    logger.info({ depositReceipts }, "Deposit completed!");

    this.nightfallDepositTxHashes.push(
      depositReceipts.txReceiptL2?.transactionHash,
    );

    return depositReceipts;
  }

  /**
   * Allow user to transfer tokens in Nightfall to other Nightfall users
   *
   * @async
   * @method makeTransfer
   * @param {UserMakeTransfer} options
   * @param {String} options.tokenContractAddress
   * @param {String} options.tokenErcStandard
   * @param {String} options.value
   * @param {String} [options.feeWei]
   * @param {String} options.recipientNightfallAddress
   * @param {Boolean} [options.isOffChain]
   * @returns {Promise<OnChainTransactionReceipts | OffChainTransactionReceipt>}
   */
  async makeTransfer(
    options: UserMakeTransfer,
  ): Promise<OnChainTransactionReceipts | OffChainTransactionReceipt> {
    logger.debug(options, "User :: makeTransfer");

    makeTransferOptions.validate(options);

    // Format options
    const value = options.value.trim();
    const feeWei = options.feeWei?.trim() || TX_FEE_MATIC_WEI_DEFAULT;
    const tokenContractAddress = options.tokenContractAddress.trim();
    const tokenErcStandard = options.tokenErcStandard.trim().toUpperCase();
    const recipientNightfallAddress = options.recipientNightfallAddress.trim();
    const isOffChain = options.isOffChain || false;

    // Set token only if it's not set or is different
    if (!this.token || tokenContractAddress !== this.token.contractAddress) {
      this.token = await TokenFactory.create({
        contractAddress: tokenContractAddress,
        ercStandard: tokenErcStandard,
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
      recipientNightfallAddress,
      isOffChain,
    );
    logger.info({ transferReceipts }, "Transfer completed!");

    this.nightfallTransferTxHashes.push(
      transferReceipts.txReceiptL2?.transactionHash,
    );

    return transferReceipts;
  }

  /**
   * Allow user to request a withdrawal from Layer2
   *
   * @async
   * @method makeWithdrawal
   * @param {UserMakeWithdrawal} options
   * @param {String} options.tokenContractAddress
   * @param {String} options.tokenErcStandard
   * @param {String} options.value
   * @param {String} [options.feeWei]
   * @param {String} options.recipientEthAddress
   * @param {Boolean} [options.isOffChain]
   * @returns {Promise<OnChainTransactionReceipts | OffChainTransactionReceipt>}
   */
  async makeWithdrawal(
    options: UserMakeWithdrawal,
  ): Promise<OnChainTransactionReceipts | OffChainTransactionReceipt> {
    logger.debug({ options }, "User :: makeWithdrawal");

    makeWithdrawalOptions.validate(options);

    // Format options
    const value = options.value.trim();
    const feeWei = options.feeWei?.trim() || TX_FEE_MATIC_WEI_DEFAULT;
    const tokenContractAddress = options.tokenContractAddress.trim();
    const tokenErcStandard = options.tokenErcStandard.trim().toUpperCase();
    const recipientEthAddress = options.recipientEthAddress.trim();
    const isOffChain = options.isOffChain || false;

    // Set token only if it's not set or is different
    if (!this.token || tokenContractAddress !== this.token.contractAddress) {
      this.token = await TokenFactory.create({
        contractAddress: tokenContractAddress,
        ercStandard: tokenErcStandard,
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
      recipientEthAddress,
      isOffChain,
    );
    logger.info({ withdrawalReceipts }, "Withdrawal completed!");

    this.nightfallWithdrawalTxHashes.push(
      withdrawalReceipts.txReceiptL2?.transactionHash,
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
   * @returns {Promise<TransactionReceipt>}
   */
  async finaliseWithdrawal(
    options: UserFinaliseWithdrawal,
  ): Promise<TransactionReceipt> {
    logger.debug({ options }, "User :: finaliseWithdrawal");
    finaliseWithdrawalOptions.validate(options);

    // If no withdrawTxHash was given, try to use the latest
    const withdrawTxHash =
      options.withdrawTxHash?.trim() ||
      this.nightfallWithdrawalTxHashes[
        this.nightfallWithdrawalTxHashes.length - 1
      ];
    if (!withdrawTxHash)
      throw new NightfallSdkError("Could not find any withdrawal tx hash");

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
   * @returns {Promise<>} - This promise resolves into an object containing the aggregated value per token, for deposit transactions that have not been included yet in a Layer2 block
   */
  async checkPendingDeposits(options?: UserCheckBalances) {
    logger.debug({ options }, "User :: checkPendingDeposits");

    let tokenContractAddresses: string[] = [];

    // If options, validate and format
    if (options) {
      checkBalancesOptions.validate(options);
      tokenContractAddresses =
        options.tokenContractAddresses?.map((address) => address.trim()) || [];
    }

    return this.client.getPendingDeposits(this.zkpKeys, tokenContractAddresses);
  }

  /**
   * Allow user to get the total Nightfall Layer2 balance of its commitments
   *
   * @async
   * @method checkNightfallBalances
   * @returns {Promise<>} - This promise resolves into an object containing the aggregated value per token, for commitments available in Layer2
   */
  async checkNightfallBalances() {
    return this.client.getNightfallBalances(this.zkpKeys);
  }

  /**
   * Allow user to check the balance of the pending spent commitments on Layer2
   *
   * @async
   * @method checkPendingTransfers
   * @returns {Promise<>}  - This promise resolves into an object whose properties are the
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
   * @returns {Promise<void | null>}
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

  close() {
    logger.debug("User :: close");
    this.web3Websocket.close();
  }
}

export default UserFactory;
