import Queue from "queue";
import path from "path";
import {
  CONTRACT_SHIELD,
  NIGHTFALL_DEFAULT_CONFIG,
  TX_FEE_DEFAULT,
} from "./constants";
import { UserConfig, UserDeposit } from "./types";
import {
  getEthAddressFromPrivateKey,
  createZkpKeysFromMnemonic,
} from "../keys";
import { Client } from "../client";
import { Web3Websocket } from "../ethereum";
import { parentLogger } from "../utils";
import { createDeposit } from "../transactions/deposit";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

class User {
  // constructor
  blockchainNetwork: string;
  blockchainWs: string;
  apiUrl: string;
  web3Websocket;
  client;

  // init
  shieldContractAddress: null | string = null;
  ethPrivateKey: null | string = null;
  ethAddress: null | string = null;
  nightfallMnemonic: null | string = null;
  zkpKeys: any = null;

  // when transacting
  token: any = null;
  txQueue: Queue = null;

  constructor(env = NIGHTFALL_DEFAULT_CONFIG) {
    logger.debug({ env }, "new User connected to");

    this.blockchainNetwork = env.blockchainNetwork.toLowerCase();
    this.blockchainWs = env.blockchainWsUrl.toLowerCase();
    this.apiUrl = env.clientApiUrl.toLowerCase();

    this.web3Websocket = new Web3Websocket(this.blockchainWs);
    this.client = new Client(this.apiUrl);
  }

  // TODO improve return type
  async init(config: UserConfig) {
    logger.debug({ config }, "User :: init"); // TODO review logs, dedicated issue #33

    // FYI Set this.shieldContractAddress
    logger.debug("User :: setShieldContractAddress");
    this.shieldContractAddress = await this.client.getContractAddress(
      CONTRACT_SHIELD,
    );

    // FYI Set this.ethPrivateKey, this.ethAddress if valid private key
    const ethAddress = getEthAddressFromPrivateKey(
      config.ethereumPrivateKey,
      this.web3Websocket.web3,
    );
    if (!ethAddress) return null;
    this.ethPrivateKey = config.ethereumPrivateKey;
    this.ethAddress = ethAddress;

    // FYI Set this.nightfallMnemonic, this.zkpKeys,
    // subscribe to incoming viewing keys if valid mnemonic,
    // or creates one if none was provided
    const nightfallKeys = await createZkpKeysFromMnemonic(
      config.nightfallMnemonic,
      this.client,
    );
    if (!nightfallKeys) return null;
    const { nightfallMnemonic, zkpKeys } = nightfallKeys;
    this.nightfallMnemonic = nightfallMnemonic;
    this.zkpKeys = zkpKeys;

    return { User: this };
  }

  // TODO needs massive refactor
  async makeDeposit(options: UserDeposit): Promise<any> {
    logger.debug({ options }, "User :: makeDeposit");

    const deposit = await createDeposit(
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
    this.token = deposit.token;
    this.txQueue = deposit.userQueue;
  }

  async checkStatus() {
    logger.debug("User :: checkStatus");
    const _isWeb3WsAlive = !!(await this.web3Websocket.setEthBlockNo());
    const _isClientAlive = await this.client.healthCheck();
    return { _isWeb3WsAlive, _isClientAlive };
  }

  close() {
    logger.debug("User :: close");
    this.web3Websocket.close();
  }
}

export default User;
