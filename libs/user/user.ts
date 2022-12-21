import fs from "fs";
import { CONTRACT_SHIELD } from "./constants";
import {
  UserFactoryCreate,
  UserConstructor,
  UserMakeDeposit,
  UserMakeTransfer,
  UserMakeTokeniseBurn,
  UserMakeWithdrawal,
  UserFinaliseWithdrawal,
  UserCheckBalances,
  UserExportCommitments,
  UserImportCommitments,
} from "./types";
import { Client } from "../client";
import {
  Web3Websocket,
  getEthAccountAddress,
  isMetaMaskAvailable,
  getEthAccountFromMetaMask,
} from "../ethereum";
import { createZkpKeysAndSubscribeToIncomingKeys } from "../nightfall";
import {
  createAndSubmitApproval,
  createAndSubmitDeposit,
  createAndSubmitTransfer,
  createAndSubmitTokenise,
  createAndSubmitBurn,
  createAndSubmitWithdrawal,
  createAndSubmitFinaliseWithdrawal,
  prepareTokenValueTokenId,
} from "../transactions";
import { logger, NightfallSdkError } from "../utils";
import {
  createOptions,
  makeDepositOptions,
  makeTransferOptions,
  makeTokeniseOptions,
  makeBurnOptions,
  makeWithdrawalOptions,
  finaliseWithdrawalOptions,
  checkBalancesOptions,
  isInputValid,
} from "./validations";
import type { NightfallZkpKeys } from "../nightfall/types";
import type { Commitment } from "../nightfall/types";
import {
  OffChainTransactionReceipt,
  OnChainTransactionReceipts,
} from "../transactions/types";
import type { TransactionReceipt } from "web3-core";
import { commitmentsFromMnemonic } from "../nightfall";

class UserFactory {
  static async create(options: UserFactoryCreate) {
    logger.debug("UserFactory :: create");

    // Validate and format options
    const { error, value } = createOptions.validate(options);
    isInputValid(error);
    // TODO log value with obfuscation

    const {
      clientApiUrl,
      blockchainWsUrl,
      ethereumPrivateKey: ethPrivateKey,
      nightfallMnemonic,
    } = value;

    // Instantiate Client
    const client = new Client(clientApiUrl);

    // Get Shield contract address
    const shieldContractAddress = await client.getContractAddress(
      CONTRACT_SHIELD,
    );

    // Set Web3 Provider and Eth account
    // If no private key is given, SDK tries to connect via MetaMask
    let web3Websocket: Web3Websocket;
    let ethAddress: string;

    if (!ethPrivateKey) {
      isMetaMaskAvailable();
      web3Websocket = new Web3Websocket();
      ethAddress = await getEthAccountFromMetaMask(web3Websocket);
    } else {
      web3Websocket = new Web3Websocket(blockchainWsUrl);
      ethAddress = getEthAccountAddress(ethPrivateKey, web3Websocket.web3);
    }

    // Create a set of Zero-knowledge proof keys from a valid mnemonic
    // or from a new mnemonic if none was provided,
    // subscribe to incoming viewing keys
    const nightfallKeys = await createZkpKeysAndSubscribeToIncomingKeys(
      nightfallMnemonic,
      client,
    );

    return new User({
      client,
      web3Websocket,
      shieldContractAddress,
      ethPrivateKey,
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
  nightfallDepositTxHashes: string[] = [];
  nightfallTransferTxHashes: string[] = [];
  nightfallTokeniseTxHashes: string[] = [];
  nightfallBurnTxHashes: string[] = [];
  nightfallWithdrawalTxHashes: string[] = [];

  constructor(options: UserConstructor) {
    logger.debug("new User");

    let key: keyof UserConstructor;
    for (key in options) {
      this[key] = options[key];
    }
  }

  /**
   * Allow user to check client API availability and blockchain ws connection
   *
   * @async
   * @deprecated checkStatus - Will be removed in upcoming versions
   */
  async checkStatus() {
    throw new NightfallSdkError(
      "To be deprecated: use `isClientAlive`, `isWeb3WsAlive`",
    );
  }

  /**
   * Allow user to check client API availability
   *
   * @async
   * @method isClientAlive
   * @returns {Promise<boolean>}
   */
  async isClientAlive() {
    logger.debug("User :: isClientAlive");
    return this.client.healthCheck();
  }

  /**
   * Allow user to check blockchain ws connection
   *
   * @async
   * @method isWeb3WsAlive
   * @returns {Promise<boolean>}
   */
  async isWeb3WsAlive() {
    logger.debug("User :: isWeb3WsAlive");
    const isWeb3WsAlive = await this.web3Websocket.setEthBlockNo();
    return !!isWeb3WsAlive;
  }

  /**
   * Allow user to retrieve the Nightfall Mnemonic  - Keep this private
   *
   * @method getNightfallMnemonic
   * @returns {string} Nightfall mnemonic
   */
  getNightfallMnemonic(): string {
    logger.debug("User :: getNightfallMnemonic");
    return this.nightfallMnemonic;
  }

  /**
   * Allow user to retrieve Nightfall Layer2 address
   *
   * @method getNightfallAddress
   * @returns {string} Nightfall Layer2 address
   */
  getNightfallAddress(): string {
    logger.debug("User :: getNightfallAddress");
    return this.zkpKeys?.compressedZkpPublicKey;
  }

  /**
   * [Browser + MetaMask only] Update Ethereum account address
   *
   * @async
   * @method updateEthAccountFromMetamask
   * @returns {string} Ethereum account address
   */
  async updateEthAccountFromMetamask() {
    logger.debug("User :: updateEthAccountFromMetamask");
    if (this.ethPrivateKey) throw new NightfallSdkError("Method not available");
    const ethAddress = await getEthAccountFromMetaMask(this.web3Websocket);
    this.ethAddress = ethAddress;
    return ethAddress;
  }

  /**
   * Deposits a Layer 1 token into Layer 2, so that it can be transacted privately
   *
   * @async
   * @method makeDeposit
   * @param {UserMakeDeposit} options
   * @param {string} options.tokenContractAddress
   * @param {string} [options.tokenErcStandard] Will be deprecated
   * @param {string} [options.value]
   * @param {string} [options.tokenId]
   * @param {string} [options.feeWei]
   * @param {boolean} [options.isFeePaidInL2]
   * @returns {Promise<OnChainTransactionReceipts>}
   */
  async makeDeposit(
    options: UserMakeDeposit,
  ): Promise<OnChainTransactionReceipts> {
    logger.debug({ options }, "User :: makeDeposit");

    // Validate and format options
    const { error, value: joiValue } = makeDepositOptions.validate(options);
    isInputValid(error);
    logger.debug({ joiValue }, "makeDeposit formatted parameters");

    const { tokenContractAddress, value, feeWei } = joiValue;
    let { tokenId } = joiValue;

    // Determine ERC standard, set value/tokenId defaults,
    // create an instance of Token, convert value to Wei if needed
    const result = await prepareTokenValueTokenId(
      tokenContractAddress,
      value,
      tokenId,
      this.web3Websocket.web3,
    );
    const { token, valueWei } = result;
    tokenId = result.tokenId;

    // Approval
    const approvalReceipt = await createAndSubmitApproval(
      token,
      this.ethAddress,
      this.ethPrivateKey,
      this.shieldContractAddress,
      this.web3Websocket.web3,
      valueWei,
    );
    if (approvalReceipt)
      logger.info({ approvalReceipt }, "Approval completed!");

    // Deposit
    const depositReceipts = await createAndSubmitDeposit(
      token,
      this.ethAddress,
      this.ethPrivateKey,
      this.zkpKeys,
      this.shieldContractAddress,
      this.web3Websocket.web3,
      this.client,
      valueWei,
      tokenId,
      feeWei,
    );
    logger.info({ depositReceipts }, "Deposit completed!");

    this.nightfallDepositTxHashes.push(
      depositReceipts.txReceiptL2?.transactionHash,
    );

    return depositReceipts;
  }

  /**
   * Transfers a token within Layer 2
   *
   * @async
   * @method makeTransfer
   * @param {UserMakeTransfer} options
   * @param {string} options.tokenContractAddress
   * @param {string} [options.tokenErcStandard] Will be deprecated
   * @param {string} [options.value]
   * @param {string} [options.tokenId]
   * @param {string} [options.feeWei]
   * @param {string} options.recipientNightfallAddress
   * @param {Boolean} [options.isOffChain]
   * @returns {Promise<OnChainTransactionReceipts | OffChainTransactionReceipt>}
   */
  async makeTransfer(
    options: UserMakeTransfer,
  ): Promise<OnChainTransactionReceipts | OffChainTransactionReceipt> {
    logger.debug(options, "User :: makeTransfer");

    // Validate and format options
    const { error, value: joiValue } = makeTransferOptions.validate(options);
    isInputValid(error);
    logger.debug({ joiValue }, "makeTransfer formatted parameters");

    const {
      tokenContractAddress,
      value,
      feeWei,
      recipientNightfallAddress,
      isOffChain,
    } = joiValue;
    let { tokenId } = joiValue;

    // Determine ERC standard, set value/tokenId defaults,
    // create an instance of Token, convert value to Wei if needed
    const result = await prepareTokenValueTokenId(
      tokenContractAddress,
      value,
      tokenId,
      this.web3Websocket.web3,
    );
    const { token, valueWei } = result;
    tokenId = result.tokenId;

    // Transfer
    const transferReceipts = await createAndSubmitTransfer(
      token,
      this.ethAddress,
      this.ethPrivateKey,
      this.zkpKeys,
      this.shieldContractAddress,
      this.web3Websocket.web3,
      this.client,
      valueWei,
      tokenId,
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
  *  Mints token within Layer 2
  *
  * @async
  * @method makeTokenise
  * @param {UserMakeTokeniseBurn} options
  * @param {string} options.tokenAddress
  * @param {string|number} options.tokenId
  * @param {number} options.value
  * @param {string} [options.salt]
  * @param {string} [options.feeWei]
  * @returns {Promise<OffChainTransactionReceipt>}
  */
  async makeTokenise(
    options: UserMakeTokeniseBurn,
  ): Promise<OffChainTransactionReceipt> {
    logger.debug(options, "User :: makeTokenise");

    const { error, value: joiValue } = makeTokeniseOptions.validate(options);
    isInputValid(error);
    logger.debug({ joiValue }, "makeTokenise formatted parameters");
  
    const { tokenAddress, tokenId, value, salt, feeWei} = joiValue;

    // Tokenise
    const tokeniseReceipts = await createAndSubmitTokenise(
      this.zkpKeys,
      this.client,
      tokenAddress,
      tokenId,
      value,
      salt,
      feeWei,
    );
    logger.info({ tokeniseReceipts }, "Tokenise completed!");

    this.nightfallTokeniseTxHashes.push(
      tokeniseReceipts.txReceiptL2?.transactionHash,
    );

    return tokeniseReceipts;
  }

  /**
  *  Burns token within Layer 2
  *
  * @async
  * @method makeBurn
  * @param {UserMakeTokeniseBurn} options
  * @param {string} options.tokenAddress
  * @param {string|number} options.tokenId
  * @param {number} options.value
  * @param {string} [options.feeWei]
  * @returns {Promise<OffChainTransactionReceipt>}
  */
   async makeBurn(
    options: UserMakeTokeniseBurn,
  ): Promise<OffChainTransactionReceipt> {
    logger.debug(options, "User :: makeBurn");

    const { error, value: joiValue } = makeBurnOptions.validate(options);
    isInputValid(error);
    logger.debug({ joiValue }, "makeBurn formatted parameters");
  
    const { tokenAddress, tokenId, value, feeWei} = joiValue;

    // Tokenise
    const burnReceipts = await createAndSubmitBurn(
      this.zkpKeys,
      this.client,
      tokenAddress,
      tokenId,
      value,
      feeWei,
    );
    logger.info({ burnReceipts }, "Burn completed!");

    this.nightfallBurnTxHashes.push(
      burnReceipts.txReceiptL2?.transactionHash,
    );

    return burnReceipts;
  }

  /**
   * Withdraws a token from Layer 2 back to Layer 1. It can then be withdrawn from the Shield contract's account by the owner in Layer 1.
   *
   * @async
   * @method makeWithdrawal
   * @param {UserMakeWithdrawal} options
   * @param {string} options.tokenContractAddress
   * @param {string} [options.tokenErcStandard] Will be deprecated
   * @param {string} [options.value]
   * @param {string} [options.tokenId]
   * @param {string} [options.feeWei]
   * @param {string} options.recipientEthAddress
   * @param {Boolean} [options.isOffChain]
   * @returns {Promise<OnChainTransactionReceipts | OffChainTransactionReceipt>}
   */
  async makeWithdrawal(
    options: UserMakeWithdrawal,
  ): Promise<OnChainTransactionReceipts | OffChainTransactionReceipt> {
    logger.debug({ options }, "User :: makeWithdrawal");

    // Validate and format options
    const { error, value: joiValue } = makeWithdrawalOptions.validate(options);
    isInputValid(error);
    logger.debug({ joiValue }, "makeWithdrawal formatted parameters");

    const {
      tokenContractAddress,
      value,
      feeWei,
      recipientEthAddress,
      isOffChain,
    } = joiValue;
    let { tokenId } = joiValue;

    // Determine ERC standard, set value/tokenId defaults,
    // create an instance of Token, convert value to Wei if needed
    const result = await prepareTokenValueTokenId(
      tokenContractAddress,
      value,
      tokenId,
      this.web3Websocket.web3,
    );
    const { token, valueWei } = result;
    tokenId = result.tokenId;

    // Withdrawal
    const withdrawalReceipts = await createAndSubmitWithdrawal(
      token,
      this.ethAddress,
      this.ethPrivateKey,
      this.zkpKeys,
      this.shieldContractAddress,
      this.web3Websocket.web3,
      this.client,
      valueWei,
      tokenId,
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
   * @param {string} [options.withdrawTxHashL2] If not provided, will attempt to use latest withdrawal transaction hash
   * @returns {Promise<TransactionReceipt>}
   */
  async finaliseWithdrawal(
    options?: UserFinaliseWithdrawal,
  ): Promise<TransactionReceipt> {
    logger.debug({ options }, "User :: finaliseWithdrawal");

    let withdrawTxHashL2 = "";

    // If options were passed validate and format, else use latest withdrawal hash
    if (options) {
      const { error, value } = finaliseWithdrawalOptions.validate(options);
      isInputValid(error);
      withdrawTxHashL2 = value.withdrawTxHashL2;
    } else {
      const withdrawalTxHashes = this.nightfallWithdrawalTxHashes;
      withdrawTxHashL2 = withdrawalTxHashes[withdrawalTxHashes.length - 1];
    }

    if (!withdrawTxHashL2)
      throw new NightfallSdkError("Could not find any withdrawal tx hash");

    logger.debug({ withdrawTxHashL2 }, "Finalise withdrawal with tx hash");

    return createAndSubmitFinaliseWithdrawal(
      this.ethAddress,
      this.ethPrivateKey,
      this.shieldContractAddress,
      this.web3Websocket.web3,
      this.client,
      withdrawTxHashL2,
    );
  }

  /**
   * Allow user to check the deposits that haven't been processed yet
   *
   * @async
   * @method checkPendingDeposits
   * @param {UserCheckBalances} [options]
   * @param {string[]} [options.tokenContractAddresses] A list of token addresses
   * @returns {Promise<*>} Should resolve into an object containing the aggregated value per token, for deposit tx that have not been included yet in a Layer2 block
   */
  async checkPendingDeposits(options?: UserCheckBalances) {
    logger.debug({ options }, "User :: checkPendingDeposits");

    let tokenContractAddresses: string[] = [];

    // If options were passed, validate and format
    if (options) {
      const { error, value } = checkBalancesOptions.validate(options);
      isInputValid(error);
      tokenContractAddresses = value.tokenContractAddresses;
    }
    logger.debug(
      { tokenContractAddresses },
      "Get pending deposits for token addresses",
    );
    return this.client.getPendingDeposits(this.zkpKeys, tokenContractAddresses);
  }

  /**
   * Allow user to get the total Nightfall Layer2 balance of its commitments
   *
   * @async
   * @method checkNightfallBalances
   * @returns {Promise<*>} Should resolve into an object containing the aggregated value per token, for commitments available in Layer2
   */
  async checkNightfallBalances() {
    logger.debug("User :: checkNightfallBalances");
    return this.client.getNightfallBalances(this.zkpKeys);
  }

  /**
   * Allow user to check the balance of the pending spent commitments on Layer2
   *
   * @async
   * @method checkPendingTransfers
   * @returns {Promise<*>}
   */
  async checkPendingTransfers() {
    logger.debug("User :: checkPendingTransfers");
    return this.client.getPendingTransfers(this.zkpKeys);
  }

  /**
   * Allow user to export commitments
   *
   * @async
   * @method exportCommitments
   * @param {UserExportCommitments} options
   * @param {String[]} options.listOfCompressedZkpPublicKey
   * @param {string} options.pathToExport
   * @param {string} options.fileName
   * @returns {Promise<void | null>}
   */
  async exportCommitments(
    options: UserExportCommitments,
  ): Promise<void | null> {
    logger.debug({ options }, "User :: exportCommitments");
    try {
      const allCommitmentsByCompressedZkpPublicKey: Commitment[] =
        await this.client.getCommitmentsByCompressedZkpPublicKey(
          options.listOfCompressedZkpPublicKey,
        );

      if (
        allCommitmentsByCompressedZkpPublicKey &&
        allCommitmentsByCompressedZkpPublicKey.length > 0
      ) {
        fs.writeFileSync(
          `${options.pathToExport}${options.fileName}`,
          JSON.stringify(allCommitmentsByCompressedZkpPublicKey),
        );
        return;
      }
      logger.warn(
        "Either you don't have any commitments for this listOfCompressedZkpPublicKey or this one is invalid!",
      );
      return null;
    } catch (err) {
      logger.child({ options }).error(err, "Error while exporting commitments");
      return null;
    }
  }

  /**
   * Allow user to import commitments
   *
   * @async
   * @method importAndSaveCommitments
   * @param {UserImportCommitments} options
   * @param {string} options.compressedZkpPublicKey
   * @param {string} options.pathToImport
   * @param {string} options.fileName
   * @returns {Promise<string>}
   */
  async importAndSaveCommitments(options: UserImportCommitments) {
    logger.debug({ options }, "User :: importAndSaveCommitments");
    const file = fs.readFileSync(`${options.pathToImport}${options.fileName}`);
    const listOfCommitments: Commitment[] = JSON.parse(file.toString("utf8"));

    commitmentsFromMnemonic(listOfCommitments, options.compressedZkpPublicKey);

    const res = await this.client.saveCommitments(listOfCommitments);
    const { successMessage } = res;
    logger.info(successMessage);

    return successMessage;
  }

  /**
   * Close user blockchain ws connection
   */
  close() {
    logger.debug("User :: close");
    this.web3Websocket.close();
  }
}

export default UserFactory;
