import { generateMnemonic, validateMnemonic } from "bip39";
import Client from "./client";
import { Env, UserConfig } from "./types";
import logger from "../libs/logger";
import Web3Websocket from "../libs/web3";

// TODO rm `environments` from this file
const environments: { [key: string]: Env } = {
  development: {
    clientApiUrl: "http://localhost:8080",
    web3WsUrl: "ws://localhost:8546",
  },
};

class User {
  // TODO improve typings
  envString: string;
  currentEnv: Env;
  web3Websocket;
  client;

  ethereumPrivateKey: null | string;

  shieldContractAddress: null | string = null;
  tokenContractAddress: null | string = null;
  tokenStandard = "";

  nightfallMnemonic: null | string = null;
  zkpKeys: any = null;

  constructor(env: string) {
    logger.debug({ env }, "new User connected to");
    this.envString = env; // TODO validate env string
    this.currentEnv = environments[env];
    this.web3Websocket = new Web3Websocket(this.currentEnv.web3WsUrl);
    this.client = new Client(this.currentEnv.clientApiUrl);
  }

  async init(config: UserConfig) {
    logger.debug({ config }, "User :: init"); // TODO review logs, careful not to log sensitive data

    // FYI Set this.ethereumPrivateKey
    this.setEthPrivateKey(config.ethereumPrivateKey);

    // FYI Set this.shieldContractAddress, this.tokenContractAddress
    this.tokenStandard = config.tokenStandard;
    await this.setContractAddress("shieldContractAddress", "Shield"); // TODO improve
    await this.setContractAddress("tokenContractAddress", config.tokenStandard);

    // FYI Set this.nightfallMnemonic, this.zkpKeys, call subscribeToIncomingViewingKeys
    await this.setZkpKeysFromMnemonic(config.nightfallMnemonic);

    return {
      ethereumPrivateKey: this.ethereumPrivateKey,
      nightfallMnemonic: this.nightfallMnemonic,
      tokenStandard: this.tokenContractAddress,
    };
  }

  setEthPrivateKey(ethereumPrivateKey: string): null | string {
    logger.debug("User :: setEthPrivateKey");
    this.ethereumPrivateKey = this.validateEthPrivateKey(ethereumPrivateKey); // TODO review validation, could be privateKeyToAccount although format checking (0x) is still necessary
    return this.ethereumPrivateKey;
  }

  // ? Private method
  validateEthPrivateKey(ethereumPrivateKey: string): null | string {
    logger.debug("User :: validateEthPrivateKey");
    try {
      const isEthPrivateKey =
        this.web3Websocket.web3.utils.isHexStrict(ethereumPrivateKey);
      if (!isEthPrivateKey) throw new Error("Invalid Ethereum private key");
      logger.info("Given eth key is hex strict");
    } catch (err) {
      logger.error(err);
      return null;
    }
    return ethereumPrivateKey;
  }

  async setZkpKeysFromMnemonic(mnemonic: undefined | string) {
    logger.debug("User :: setZkpKeysFromMnemonic");

    // FYI Set this.nightfallMnemonic
    this.setNfMnemonic(mnemonic);
    if (!this.nightfallMnemonic) return null;

    // FYI Set this.zkpKeys
    const _mnemonicAddressIdx = 0;
    this.zkpKeys = await this.client.generateZkpKeys(
      this.nightfallMnemonic,
      _mnemonicAddressIdx,
    );
    if (!this.zkpKeys) return this.nightfallMnemonic;

    await this.client.subscribeToIncomingViewingKeys(this.zkpKeys);

    return {
      nightfallMnemonic: this.nightfallMnemonic,
      zkpKeys: this.zkpKeys,
    };
  }

  // ? Private method, improve return type
  setNfMnemonic(mnemonic: undefined | string) {
    logger.debug("User :: setNfMnemonic");
    let _mnemonic: null | string;
    if (!mnemonic) {
      _mnemonic = generateMnemonic(); // FYI using bip39
      logger.info("New mnemonic");
    } else {
      _mnemonic = this.validateNfMnemonic(mnemonic);
    }
    this.nightfallMnemonic = _mnemonic;
  }

  // ? Private method
  validateNfMnemonic(mnemonic: string): null | string {
    logger.debug("User :: validateNfMnemonic");
    try {
      const isMnemonic = validateMnemonic(mnemonic); // FYI using bip39
      if (!isMnemonic) throw new Error("Invalid mnemonic");
      logger.info("Given mnemonic is valid");
    } catch (err) {
      logger.error(err);
      return null;
    }
    return mnemonic;
  }

  async setContractAddress(
    prop: string,
    contractName: string,
  ): Promise<null | string> {
    const logObj = { prop, contractName }; // TODO review internal vars underscore
    logger.debug(logObj, "User :: setContractAddress");
    const _contractProps = ["shieldContractAddress", "tokenContractAddress"]; // TODO improve
    if (!_contractProps.includes(prop) || !contractName.length) return null;
    (this as any)[prop] = await this.client.getContractAddress(contractName); // TODO fix, api is case sensitive!!
    // return this[prop]; // TODO fix, https://stackoverflow.com/questions/12710905/how-do-i-dynamically-assign-properties-to-an-object-in-typescript
  }

  // TODO improve typings
  async checkStatus() {
    logger.debug("User :: checkStatus");
    const _isWeb3WsAlive = !!(await this.web3Websocket.setEthBlockNo());
    const _isClientAlive = await this.client.healthCheck();
    return { _isWeb3WsAlive, _isClientAlive };
  }

  close() {
    this.web3Websocket.close();
  }
}

export default User;
