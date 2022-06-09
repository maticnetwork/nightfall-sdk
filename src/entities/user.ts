import { generateMnemonic, validateMnemonic } from "bip39";
import Client from "./client";
import { Env, UserConfig } from "../types/types";
import logger from "../utils/logger";
import Token from "../utils/token";
import Web3Websocket from "../utils/web3Websocket";

const ENV_BC_NETWORK_DEFAULT = "ganache";
const ENV_BC_WEBSOCKET_DEFAULT = "ws://localhost:8546";
const ENV_API_URL_DEFAULT = "http://localhost:8080";

const NIGHTFALL_DEFAULT_CONFIG: Env = {
  blockchainNetwork: ENV_BC_NETWORK_DEFAULT,
  blockchainWs: ENV_BC_WEBSOCKET_DEFAULT,
  apiUrl: ENV_API_URL_DEFAULT,
};

class User {
  // constructor
  blockchainNetwork: string;
  blockchainWs: string;
  apiUrl: string;
  web3Websocket;
  client;

  // config
  shieldContractAddress: null | string = null;
  ethPrivateKey: null | string = null;
  ethAddress: null | string = null;
  token: any = null;
  nightfallMnemonic: null | string = null;
  zkpKeys: any = null;

  constructor(env = NIGHTFALL_DEFAULT_CONFIG) {
    console.log(logger);
    logger.debug({ env }, "new User connected to");
    this.blockchainNetwork = env.blockchainNetwork.toLowerCase();
    this.blockchainWs = env.blockchainWs.toLowerCase();
    this.apiUrl = env.apiUrl.toLowerCase();

    this.web3Websocket = new Web3Websocket(this.blockchainWs);
    this.client = new Client(this.apiUrl);
  }

  async configUser(config: UserConfig) {
    logger.debug({ config }, "User :: configUser"); // TODO review logs, careful not to log sensitive data in prod

    // FYI Set this.shieldContractAddress
    logger.debug("User :: setShieldContractAddress");
    this.shieldContractAddress = await this.client.getContractAddress("Shield"); // TODO improve

    // FYI Set this.ethPrivateKey, this.ethAddress
    this.setEthAddressFromPrivateKey(config.ethereumPrivateKey);

    // FYI Set this.nightfallMnemonic, this.zkpKeys, call subscribeToIncomingViewingKeys
    await this.setZkpKeysFromMnemonic(config.nightfallMnemonic);

    return { User: this };
  }

  setEthAddressFromPrivateKey(ethereumPrivateKey: string) {
    logger.debug("User :: setEthAddressFromPrivateKey");
    let _ethAddress;
    try {
      _ethAddress = this.validateEthPrivateKey(ethereumPrivateKey);
    } catch (err) {
      logger.child({ ethereumPrivateKey }).error(err);
      return null;
    }
    logger.info({ ethAddress: _ethAddress }, "Eth address is");

    this.ethPrivateKey = ethereumPrivateKey;
    this.ethAddress = _ethAddress;

    return { ethereumAddress: this.ethAddress };
  }

  async setZkpKeysFromMnemonic(mnemonic: undefined | string) {
    logger.debug({ mnemonic }, "User :: setZkpKeysFromMnemonic");

    // FYI Set this.nightfallMnemonic
    this.setNfMnemonic(mnemonic);
    if (this.nightfallMnemonic === null) return null; // TODO review bangs

    // FYI Set this.zkpKeys
    const _mnemonicAddressIdx = 0;
    this.zkpKeys = await this.client.generateZkpKeysFromMnemonic(
      this.nightfallMnemonic,
      _mnemonicAddressIdx,
    );
    if (this.zkpKeys === null) return this.nightfallMnemonic;

    await this.client.subscribeToIncomingViewingKeys(this.zkpKeys);

    return {
      nightfallMnemonic: this.nightfallMnemonic,
      nightfallZkpKeys: this.zkpKeys,
      nightfallAddress: this.zkpKeys?.compressedPkd || null,
    };
  }

  setNfMnemonic(mnemonic: undefined | string): undefined {
    logger.debug({ mnemonic }, "User :: setNfMnemonic");
    let _mnemonic: null | string;
    if (!mnemonic) {
      _mnemonic = generateMnemonic(); // FYI using bip39
      logger.info("New mnemonic");
    } else {
      try {
        _mnemonic = this.validateNfMnemonic(mnemonic);
      } catch (err) {
        logger.child({ mnemonic }).error(err);
        return null;
      }
      logger.info("Valid mnemonic");
    }
    this.nightfallMnemonic = _mnemonic;
  }

  // async setToken(tokenName: string): Promise<null | string> {
  //   logger.debug({ tokenName }, "User :: setToken");
  //   let _fmTokenName;
  //   try {
  //     _fmTokenName = this.validateTokenName(tokenName);
  //   } catch (err) {
  //     logger.child({ tokenName }).error(err);
  //     return null;
  //   }
  //   logger.info({ fmTokenName: _fmTokenName }, "Token is");

  //   this.token = new Token({
  //     web3: this.web3Websocket.web3,
  //     name: _fmTokenName,
  //     config: this.supportedTokens[_fmTokenName],
  //   });
  //   return this.token;
  // }

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

  /*
    Private methods, or perhaps some of these might be shared with Proposer, etc.
  */
  validateEthPrivateKey(ethereumPrivateKey: string): null | string {
    logger.debug("User :: validateEthPrivateKey");
    const _isKeyHexStrict =
      this.web3Websocket.web3.utils.isHexStrict(ethereumPrivateKey);
    if (!_isKeyHexStrict)
      throw new Error("Invalid eth private key: string is not HEX string");
    logger.info("Given eth key is hex strict");

    const _ethAccount =
      this.web3Websocket.web3.eth.accounts.privateKeyToAccount(
        ethereumPrivateKey,
      ); // TODO review: how can this fail?
    return _ethAccount.address;
  }

  validateNfMnemonic(mnemonic: string): null | string {
    logger.debug({ mnemonic }, "User :: validateNfMnemonic");
    const _isMnemonic = validateMnemonic(mnemonic); // FYI using bip39
    if (!_isMnemonic) throw new Error("Invalid mnemonic");
    return mnemonic;
  }

  // validateTokenName(tokenName: string) {
  //   logger.debug({ tokenName }, "User :: validateTokenName");
  //   const _fmTokenName = tokenName.toUpperCase();
  //   if (!Object.keys(this.supportedTokens).includes(_fmTokenName))
  //     throw new Error("Unknown token standard");
  //   return _fmTokenName;
  // }
}

export default User;