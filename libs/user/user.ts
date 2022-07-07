import Queue from "queue";
import path from "path";
import { CONTRACT_SHIELD, TX_FEE_DEFAULT } from "./constants";
import { UserFactoryOptions, UserOptions, UserDeposit } from "./types";
import { Client } from "../client";
import { Web3Websocket, getEthAddressFromPrivateKey } from "../ethereum";
import { createZkpKeysFromMnemonic } from "../nightfall";
import { createDeposit } from "../transactions/deposit";
import { parentLogger } from "../utils";
import { createOptions } from "./validations";
import type { NightfallZkpKeys } from "../nightfall/types";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

class UserFactory {
  static async create(options: UserFactoryOptions) {
    logger.debug("UserFactory :: create");
    createOptions.validate(options);

    // Instantiate Client and Web3Websocket
    const client = new Client(options.clientApiUrl.toLowerCase());
    const web3Websocket = new Web3Websocket(
      options.blockchainWsUrl.toLowerCase(),
    );

    // Get Shield contract address
    const shieldContractAddress = await client.getContractAddress(
      CONTRACT_SHIELD,
    );
    if (!shieldContractAddress) return null;

    // Get ethAddress from private key if it's a valid key
    const ethAddress = getEthAddressFromPrivateKey(
      options.ethereumPrivateKey,
      web3Websocket.web3,
    );
    if (!ethAddress) return null;

    // Create Zero-knowledge proof keys from a valid mnemonic
    // or from a new mnemonic if none was provided,
    // subscribe to incoming viewing keys
    const nightfallKeys = await createZkpKeysFromMnemonic(
      options.nightfallMnemonic,
      client,
    );
    if (!nightfallKeys) return null;

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
  client: Client;
  web3Websocket: Web3Websocket;
  shieldContractAddress: string;
  ethPrivateKey: string;
  ethAddress: string;
  nightfallMnemonic: string;
  zkpKeys: NightfallZkpKeys;

  constructor(options: UserOptions) {
    logger.debug("new User");
    let key: keyof UserOptions;
    for (key in options) {
      this[key] = options[key];
    }
  }

  // TODO needs massive refactor
  async makeDeposit(options: UserDeposit): Promise<any> {
    logger.debug({ options }, "User :: makeDeposit");

    return createDeposit(
      options.tokenAddress,
      options.tokenStandard,
      options.value,
      options.fee || TX_FEE_DEFAULT,
      this.shieldContractAddress,
      this.ethPrivateKey,
      this.ethAddress,
      this.zkpKeys,
      this.web3Websocket.web3,
      this.client,
    );
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
