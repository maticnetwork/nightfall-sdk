import path from "path";
import { CONTRACT_KYC, CONTRACT_WHITELIST } from "./constants";
import UserCommon from "./userCommon";
import {
  WhitelistManagerFactoryCreate,
  WhitelistManagerConstructor,
  EthAddress,
} from "./types";
import { Client } from "../client";
import {
  Web3Websocket,
  getEthAccountAddress,
  isMetaMaskAvailable,
  getEthAccountFromMetaMask,
} from "../ethereum";
import {
  EthereumTransactionReceipts,
} from "../transactions/types";
import { parentLogger } from "../utils";
import {
  createOptions,
  ethAddressOptions,
  isInputValid,
} from "./validations";
import {
  createAndSubmitAddAddressToWhitelist,
  createAndSubmitRemoveAddressFromWhitelist,
} from "../transactions";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

class WhitelistManagerFactory {
  static async create(options: WhitelistManagerFactoryCreate) {
    logger.debug("WhitelistManagerFactory :: create");

    // Validate and format options
    const { error, value } = createOptions.validate(options);
    isInputValid(error);
    // TODO log value with obfuscation ISSUE #33

    const {
      clientApiUrl,
      blockchainWsUrl,
      ethereumPrivateKey: ethPrivateKey,
    } = value;

    // Instantiate Client
    const client = new Client(clientApiUrl);

    // Get Whitelist contract address
    const whitelistContractAddress = await client.getContractAddress(
      CONTRACT_WHITELIST,
    );

    // Get KYC contract address
    const kycContractAddress = await client.getContractAddress(
      CONTRACT_KYC,
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

    return new WhitelistManager({
      client,
      web3Websocket,
      whitelistContractAddress,
      kycContractAddress,
      ethPrivateKey,
      ethAddress,
    });
  }
}

class WhitelistManager extends UserCommon {
  // Set by constructor
  client: Client;
  web3Websocket: Web3Websocket;
  whitelistContractAddress: string;
  kycContractAddress: string;
  ethPrivateKey: string;
  ethAddress: string;

  constructor(options: WhitelistManagerConstructor) {
    logger.debug("new User");
    
    super(options);
    this.client = options.client;
    this.web3Websocket = options.web3Websocket;
    this.whitelistContractAddress = options.whitelistContractAddress;
    this.kycContractAddress = options.kycContractAddress;
    this.ethPrivateKey = options.ethPrivateKey;
    this.ethAddress = options.ethAddress;

  }

  /**
   * Whitelist an Ethereum address
   *
   * @async
   * @method addAddressToWhitelist
   * @param {EthAddress} options
   * @param {string} options.ethAddress
   * @returns {Promise<EthereumTransactionReceipts>}
   */
    async addAddressToWhitelist(
      options: EthAddress
    ): Promise<EthereumTransactionReceipts> {
     logger.debug({ options }, "WhitelistManager :: addAddressToWhitelist");
         
     // Validate and format options
     const { error, value: joiValue } = ethAddressOptions.validate(options);
     isInputValid(error);
     logger.debug({ joiValue }, "addAddressToWhitelist formatted parameters");

     const { ethAddress } = joiValue;

     const whitelistReceipts = await createAndSubmitAddAddressToWhitelist(
      this.ethAddress,
      this.ethPrivateKey,
      this.whitelistContractAddress,
      this.web3Websocket.web3,
      this.client,
      ethAddress);

     logger.info({ whitelistReceipts }, "Address added to whitelist completed!");

     return whitelistReceipts;
    }

  /**
   * Remove Ethereum address from whitelist group
   *
   * @async
   * @method removeAddressFromWhitelist
   * @param {EthAddress} options
   * @param {string} options.ethAddress
   * @returns {Promise<EthereumTransactionReceipts>}
   */
     async removeAddressFromWhitelist(
       options: EthAddress
    ): Promise<EthereumTransactionReceipts> {
      logger.debug({ options }, "WhitelistManager :: removeAddressFromWhitelist");
         
      // Validate and format options
      const { error, value: joiValue } = ethAddressOptions.validate(options);
      isInputValid(error);
      logger.debug({ joiValue }, "removeAddressFromWhitelist formatted parameters");

      const { ethAddress } = joiValue;

      const whitelistReceipts = await createAndSubmitRemoveAddressFromWhitelist(
      this.ethAddress,
      this.ethPrivateKey,
      this.whitelistContractAddress,
      this.web3Websocket.web3,
      this.client,
      ethAddress);

      logger.info({ whitelistReceipts }, "Address removed from whitelist completed!");

     return whitelistReceipts;
    }
}

export default WhitelistManagerFactory;
