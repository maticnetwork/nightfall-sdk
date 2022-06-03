import { generateMnemonic, validateMnemonic } from "bip39";
import Client from "./client";
import Web3Websocket from "../libs/web3";
import { UserConfig } from "./types";

// TODO rm `environments` from this file
const environments = {
  "development": {
    "clientApiUrl": "http://localhost:8080",
    "web3WsUrl": "ws://localhost:8546",
  },
};

class User {
  // TODO improve typings
  envString: string;
  currentEnv;
  web3; // TODO rename
  client;

  ethereumPrivateKey: null | string;

  shieldContractAddress: string;
  tokenContractAddress: null | string;
  tokenStandard: string;

  nightfallMnemonic: null | string;
  zkpKeys;

  constructor(env: string) {
    // TODO validate env string
    this.envString = env;
    this.currentEnv = environments[env];
    this.web3 = new Web3Websocket(this.currentEnv.web3WsUrl);
    this.client = new Client(this.currentEnv.clientApiUrl);
  }

  async init(config: UserConfig) {
    // FYI Set this.ethereumPrivateKey
    this.setEthPrivateKey(config.ethereumPrivateKey);

    // FYI Set this.shieldContractAddress, this.tokenContractAddress
    this.tokenStandard = config.tokenStandard; // TODO validate tokenStandard
    await this.setContractAddress("shieldContractAddress", "shield"); // TODO improve
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
    this.ethereumPrivateKey = this.validateEthPrivateKey(ethereumPrivateKey); // TODO review validation, could be privateKeyToAccount although format checking (0x) is still necessary
    return this.ethereumPrivateKey;
  }

  // ? Private method
  validateEthPrivateKey(ethereumPrivateKey: string): null | string {
    try {
      const isEthPrivateKey = this.web3.web3.isHexStrict(ethereumPrivateKey);
      if (!isEthPrivateKey) throw new Error("Invalid Ethereum private key");
    } catch (err) {
      console.error(err);
      return null;
    }
    return ethereumPrivateKey;
  }

  async setZkpKeysFromMnemonic(mnemonic: undefined | string) {
    // FYI Set this.nightfallMnemonic
    this.setNfMnemonic(mnemonic);
    if (!this.nightfallMnemonic) return null;

    // FYI Set this.zkpKeys
    const _mnemonicAddressIdx = 0;
    this.zkpKeys = await this.client.generateZkpKeys(
      this.nightfallMnemonic,
      _mnemonicAddressIdx
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
    let _mnemonic: null | string;
    if (!mnemonic) {
      _mnemonic = generateMnemonic(); // FYI using bip39
    } else {
      _mnemonic = this.validateNfMnemonic(mnemonic);
    }
    this.nightfallMnemonic = _mnemonic;
  }

  // ? Private method
  validateNfMnemonic(mnemonic: string): null | string {
    try {
      const isMnemonic = validateMnemonic(mnemonic); // FYI using bip39
      if (!isMnemonic) throw new Error("Invalid mnemonic");
    } catch (err) {
      console.error(err);
      return null;
    }
    return mnemonic;
  }

  async setContractAddress(
    prop: string,
    contractName: string
  ): Promise<null | string> {
    const _contractProps = ["shieldContractAddress", "tokenContractAddress"]; // TODO improve
    if (!_contractProps.includes(prop) || !contractName.length) return null;

    this[prop] = await this.client.getContractAddress(contractName);
    return this[prop];
  }

  close() {
    this.web3.close();
  }
}

export default User;
