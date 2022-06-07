import { generateMnemonic, validateMnemonic } from "bip39";
import Client from "./client";
import { Env, UserConfig } from "./types";
import { TOKEN_STANDARDS } from "../utils/constants";
import logger from "../utils/logger";
import Token from "../utils/token";
import Web3Websocket from "../utils/web3Websocket";

// TODO rm `environments` from this file
const environments: { [key: string]: Env } = {
  development: {
    clientApiUrl: "http://localhost:8080",
    web3WsUrl: "ws://localhost:8546",
  },
};

class User {
  envString: string;
  currentEnv: Env;
  web3Websocket;
  client;

  shieldContractAddress: null | string = null;
  ethPrivateKey: null | string = null;
  ethAddress: null | string = null;
  token: any = null;
  nightfallMnemonic: null | string = null;
  zkpKeys: any = null;

  constructor(env: string) {
    logger.debug({ env }, "new User connected to");
    this.envString = env; // TODO validate env string
    this.currentEnv = environments[env];
    this.web3Websocket = new Web3Websocket(this.currentEnv.web3WsUrl);
    this.client = new Client(this.currentEnv.clientApiUrl);
  }

  async configUser(config: UserConfig) {
    logger.debug({ config }, "User :: configUser"); // TODO review logs, careful not to log sensitive data in prod

    // FYI Set this.shieldContractAddress
    logger.debug("User :: setShieldContractAddress");
    this.shieldContractAddress = await this.client.getContractAddress("Shield"); // TODO improve

    // FYI Set this.ethPrivateKey, this.ethAddress
    this.setEthAddressFromPrivateKey(config.ethereumPrivateKey);

    // FYI Set this.token
    await this.setToken(config.tokenStandard);

    // FYI Set this.nightfallMnemonic, this.zkpKeys, call subscribeToIncomingViewingKeys
    await this.setZkpKeysFromMnemonic(config.nightfallMnemonic);

    return {
      hasShield: !!this.shieldContractAddress,
      isEthereumPrivateKey: !!this.ethPrivateKey,
      ethereumAddress: this.ethAddress,
      token: this.token,
      nightfallMnemonic: this.nightfallMnemonic,
      hasZkpKeys: !!this.zkpKeys, // TODO test that is never empty object
    };
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
    return {
      isEthereumPrivateKey: !!this.ethPrivateKey,
      ethereumAddress: this.ethAddress,
    };
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
      hasZkpKeys: !!this.zkpKeys,
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

  async setToken(tokenStandard: string): Promise<null | string> {
    logger.debug({ tokenStandard }, "User :: setToken");
    let _fmTokenStandard;
    try {
      _fmTokenStandard = this.validateTokenStandard(tokenStandard);
    } catch (err) {
      logger.child({ tokenStandard }).error(err);
      return null;
    }
    logger.info({ fmTokenStandard: _fmTokenStandard }, "Token standard is");

    const _tokenContractAddress = await this.client.getContractAddress(
      _fmTokenStandard,
    );
    if (_tokenContractAddress === null) return null;
    logger.info(
      { contractAddress: _tokenContractAddress },
      "Token contract at address",
    );

    this.token = new Token({
      web3: this.web3Websocket.web3,
      standard: _fmTokenStandard,
      contractAddress: _tokenContractAddress,
    });
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

  validateTokenStandard(tokenStandard: string) {
    logger.debug({ tokenStandard }, "User :: validateTokenStandard");
    const _fmTokenStandard = TOKEN_STANDARDS[tokenStandard.toUpperCase()];
    if (!Object.values(TOKEN_STANDARDS).includes(_fmTokenStandard))
      throw new Error("Unknown token standard");
    return _fmTokenStandard;
  }
}

export default User;
