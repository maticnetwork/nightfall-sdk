import Queue from "queue";
import path from "path";
import {
  CONTRACT_SHIELD,
  NIGHTFALL_DEFAULT_CONFIG,
  TX_FEE_DEFAULT,
} from "./constants";
import { UserConfig } from "./types";
import {
  getEthAddressFromPrivateKey,
  createZkpKeysFromMnemonic,
} from "../keys";
import { Client } from "../client";
import { parentLogger } from "../utils";
import Token from "../utils/token";
import Web3Websocket from "../utils/web3Websocket";
import { submitTransaction } from "../utils/transactions";
import { toBaseUnit } from "../utils/units";

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
  userQueue: Queue;

  // init
  shieldContractAddress: null | string = null;
  ethPrivateKey: null | string = null;
  ethAddress: null | string = null;
  nightfallMnemonic: null | string = null;
  zkpKeys: any = null;

  // when transacting
  token: any = null;

  constructor(env = NIGHTFALL_DEFAULT_CONFIG) {
    logger.debug({ env }, "new User connected to");
    this.blockchainNetwork = env.blockchainNetwork.toLowerCase();
    this.blockchainWs = env.blockchainWs.toLowerCase();
    this.apiUrl = env.apiUrl.toLowerCase();

    this.web3Websocket = new Web3Websocket(this.blockchainWs);
    this.client = new Client(this.apiUrl);
    this.userQueue = new Queue({ autostart: true, concurrency: 1 });
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

  async makeDeposit(
    tokenAddress: string,
    tokenStandard: string,
    value: number,
    fee = TX_FEE_DEFAULT,
  ): Promise<any> {
    logger.debug({ tokenAddress }, "User :: makeDeposit");

    // FYI Set this.token TODO only if it's not set
    await this.setToken(tokenAddress, tokenStandard);
    logger.info(
      {
        address: this.token.contractAddress,
        standard: this.token.standard,
        decimals: this.token.decimals,
      },
      "Token is",
    );

    // TODO value in wei, but what about fees?
    const _web3 = this.web3Websocket.web3;
    const _value = toBaseUnit(value.toString(), this.token.decimals, _web3);
    logger.info({ _value }, "Value in wei is");

    // Approval start (tx1)
    const _txDataToSign = await this.token.approveTransaction(
      this.ethAddress,
      this.shieldContractAddress,
      _value,
    );
    logger.info({ unsignedTx: _txDataToSign }, "Approved tx, unsigned");
    if (_txDataToSign !== null) {
      this.userQueue.push(async () => {
        try {
          const receipt1 = await submitTransaction(
            this.ethAddress,
            this.token.contractAddress,
            _txDataToSign,
            fee,
            this.ethPrivateKey,
            _web3,
          );
          logger.info({ receipt1 }, "Proof from tx 1");
        } catch (err) {
          logger.error(err);
        }
      });
      logger.info({ queue: this.userQueue }, "New tx 1 added");
    }
    // Approval end

    // Deposit start (tx2)
    const _resData = await this.client.deposit(
      this.token.contractAddress,
      this.token.standard,
      _value,
      this.zkpKeys.pkd,
      this.zkpKeys.nsk,
      fee,
    );
    if (_resData === null) return null;

    this.userQueue.push(async () => {
      try {
        const receipt2 = await submitTransaction(
          this.ethAddress,
          this.shieldContractAddress,
          _resData.txDataToSign,
          fee,
          this.ethPrivateKey,
          _web3,
        );
        logger.info({ receipt2 }, "Proof from tx 2");
      } catch (err) {
        logger.error(err);
      }
    });
    logger.info({ queue: this.userQueue }, "New tx 2 added");
    // Deposit end
    // TODO return something
  }

  async setToken(
    tokenAddress: string,
    tokenStandard: string,
  ): Promise<null | string> {
    logger.debug({ tokenAddress }, "User :: setToken");

    // TODO validate and format tokenAddress, tokenStandard

    this.token = new Token({
      web3: this.web3Websocket.web3,
      address: tokenAddress,
      standard: tokenStandard,
    });
    await this.token.init();

    return this.token;
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
