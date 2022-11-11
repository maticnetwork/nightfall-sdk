import path from "path";
import {
  UserCommonConstructor,
  EthAddress,
} from "./types";
import { Client } from "../client";
import {
  Web3Websocket,
  getEthAccountFromMetaMask,
} from "../ethereum";
import { parentLogger } from "../utils";
import {
  isInputValid,
  ethAddressOptions,
} from "./validations";
import { NightfallSdkError } from "../utils/error";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

/**
 * Basic user class definition with the implementation of basic functionalities. Rest of user classes
 * will inherit from UserCommon.
 */
class UserCommon {
  // Set by constructor
  client: Client;
  web3Websocket: Web3Websocket;
  kycContractAddress: string;
  ethPrivateKey: string;
  ethAddress: string;

  constructor(options: UserCommonConstructor) {
    logger.debug("new UserCommon");

    this.client = options.client;
    this.web3Websocket = options.web3Websocket;
    this.kycContractAddress = options.kycContractAddress;
    this.ethPrivateKey = options.ethPrivateKey;
    this.ethAddress = options.ethAddress;
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
    logger.debug("UserCommon :: isClientAlive");
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
    logger.debug("UserCommon :: isWeb3WsAlive");
    const isWeb3WsAlive = await this.web3Websocket.setEthBlockNo();
    return !!isWeb3WsAlive;
  }

  /**
   * [Browser + MetaMask only] Update Ethereum account address
   *
   * @async
   * @method updateEthAccountFromMetamask
   * @returns {string} Ethereum account address
   */
  async updateEthAccountFromMetamask() {
    logger.debug("UserCommon :: updateEthAccountFromMetamask");
    if (this.ethPrivateKey) throw new NightfallSdkError("Method not available");
    const ethAddress = await getEthAccountFromMetaMask(this.web3Websocket);
    this.ethAddress = ethAddress;
    return ethAddress;
  }

  /**
   * Checks is Ethereum address is whitelisted
   *
   * @async
   * @method isAddressWhitelisted
   * @param {EthAddress} options
   * @param {string} options.ethAddress
   * @returns {Promise<string>}
   */
     async isAddressWhitelisted(options: EthAddress) {
      logger.debug({ options }, "UserCommon :: isAddressWhitelisted");

      // Validate and format options
      const { error, value: joiValue } = ethAddressOptions.validate(options);
      isInputValid(error);
      logger.debug({ joiValue }, "isAddressWhitelisted formatted parameters");

      const { ethAddress } = joiValue;
      const isAddressWhitelisted = await this.client.isAddressWhitelisted(ethAddress)
      logger.info({ isAddressWhitelisted }, "Address whitelist checking completed!");

     return isAddressWhitelisted;
    }

  /**
   *  Performs an ongoing KYC check (is the user still in the whitelist? Has the public key been revoked? Is the cert in date?)
   *
   * @async
   * @method kycCheck
   * @param {EthAddress} options
   * @param {string} options.ethAddress
   * @returns {Promise<string>}
   */
     async kycCheck(options: EthAddress) {
      logger.debug({ options }, "UserCommon :: kycCheck");

      // Validate and format options
      const { error, value: joiValue } = ethAddressOptions.validate(options);
      isInputValid(error);
      logger.debug({ joiValue }, "kycCheck formatted parameters");

      const { ethAddress } = joiValue;
      const isAddressKyc = await this.client.kycCheck(ethAddress)
      logger.info({ isAddressKyc }, "Address Kyc checking completed!");

     return isAddressKyc;
    }

  /**
   * Close user blockchain ws connection
   */
  close() {
    logger.debug("UserCommon :: close");
    this.web3Websocket.close();
  }
}

export default UserCommon;
