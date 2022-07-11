import path from "path";
import { CONTRACT_SHIELD, TX_FEE_DEFAULT } from "./constants";
import {
  UserFactoryOptions,
  UserOptions,
  UserMakeDepositOptions,
} from "./types";
import { Client } from "../client";
import { Web3Websocket, getEthAddressFromPrivateKey } from "../ethereum";
import { createZkpKeysAndSubscribeToIncomingKeys } from "../nightfall";
import { createAndSubmitDeposit } from "../transactions/deposit";
import { parentLogger } from "../utils";
import { createOptions, makeDepositOptions } from "./validations";
import type { NightfallZkpKeys } from "../nightfall/types";
import { Token, setToken } from "../tokens";
import { toBaseUnit } from "../transactions/helpers/units";
import { submitTransaction } from "../transactions/helpers/submit";
import { createAndSubmitApproval } from "../transactions/approval";
import { func } from "joi";

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

    // Get ethAddress from private key if it's a valid key
    const ethAddress = getEthAddressFromPrivateKey(
      ethPrivateKey,
      web3Websocket.web3,
    );
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
      ethPrivateKey: options.ethereumPrivateKey,
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
  token: Token;

  constructor(options: UserOptions) {
    logger.debug("new User");

    let key: keyof UserOptions;
    for (key in options) {
      this[key] = options[key];
    }
  }

  async makeDeposit(options: UserMakeDepositOptions) {
    logger.debug({ options }, "User :: makeDeposit");
    makeDepositOptions.validate(options);

    // Format options
    let value = options.value.trim();
    const tokenAddress = options.tokenAddress.trim();
    const tokenStandard = options.tokenStandard.trim().toUpperCase();
    // TODO add fee, set default

    // Set token only if it's not set or is different
    if (!this.token || tokenAddress !== this.token.contractAddress)
      this.token = await setToken(
        tokenAddress,
        tokenStandard,
        this.web3Websocket.web3,
      );
    if (this.token === null) throw new Error("Unable to set token");

    // Transform value to wei
    value = toBaseUnit(value, this.token.decimals, this.web3Websocket.web3);
    logger.info({ value }, "Value in wei is");
    // TODO add fee

    // Deposit tx might need approval
    let txReceipt = await createAndSubmitApproval(
      this.token,
      this.ethAddress,
      this.ethPrivateKey,
      this.shieldContractAddress,
      value,
      options.fee || TX_FEE_DEFAULT,
      this.web3Websocket.web3,
    );
    if (txReceipt === null) return null;
    logger.info({ txReceipt }, "Approval completed");

    // Deposit
    txReceipt = await createAndSubmitDeposit(
      this.token,
      this.ethAddress,
      this.ethPrivateKey,
      this.zkpKeys,
      this.shieldContractAddress,
      value,
      options.fee || TX_FEE_DEFAULT,
      this.web3Websocket.web3,
      this.client,
    );
    if (txReceipt === null) return null;
    logger.info({ txReceipt }, "Deposit completed");

    return txReceipt;
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
