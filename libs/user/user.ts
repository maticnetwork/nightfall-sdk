import path from "path";
import {
  CONTRACT_SHIELD,
  NIGHTFALL_DEFAULT_CONFIG,
  TX_FEE_DEFAULT,
} from "./constants";
import { UserConfig, UserDeposit } from "./types";
import { Client } from "../client";
import { Web3Websocket, getEthAddressFromPrivateKey } from "../ethereum";
import { createZkpKeysFromMnemonic } from "../nightfall";
import { createDeposit } from "../transactions/deposit";
import { parentLogger } from "../utils";
import convertObjectToString from "../utils/convertObjectToString";
import exportFile from "../utils/exportFile";
import Commitment from "../../libs/types";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

class User {
  // Set by constructor
  web3Websocket;
  client;

  // Set by init
  shieldContractAddress: null | string = null;
  ethPrivateKey: null | string = null;
  ethAddress: null | string = null;
  nightfallMnemonic: null | string = null;
  zkpKeys: any = null;

  constructor(env = NIGHTFALL_DEFAULT_CONFIG) {
    logger.debug({ env }, "new User connected to");

    const blockchainWsUrl = env.blockchainWsUrl.toLowerCase();
    this.web3Websocket = new Web3Websocket(blockchainWsUrl);

    const clientApiUrl = env.clientApiUrl.toLowerCase();
    this.client = new Client(clientApiUrl);
  }

  // TODO improve return type
  async init(config: UserConfig) {
    logger.debug({ config }, "User :: init");

    // Set this.shieldContractAddress
    logger.debug("User :: setShieldContractAddress");
    this.shieldContractAddress = await this.client.getContractAddress(
      CONTRACT_SHIELD,
    );

    // Set this.ethPrivateKey, this.ethAddress if valid private key
    const ethAddress = getEthAddressFromPrivateKey(
      config.ethereumPrivateKey,
      this.web3Websocket.web3,
    );
    if (!ethAddress) return null;
    this.ethPrivateKey = config.ethereumPrivateKey;
    this.ethAddress = ethAddress;

    // Set this.nightfallMnemonic, this.zkpKeys,
    // subscribe to incoming viewing keys if valid mnemonic,
    // or creates one if no mnemonic was given
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

  /**
   *
   * @method exportCommitments get the commitments from the client instance and
   * export a file with this commitments to some path based in the env variables
   * that set the path and the filename.
   * @param listOfCompressedZkpPublicKey a list of compressed zkp public key derivated
   * from the user mnemonic.
   * @param pathToExport the path to export the file.
   * @param fileName the name of the file.
   * @author luizoamorim
   */
  async exportCommitments(
    listOfCompressedZkpPublicKey: string[],
    pathToExport: string,
    fileName: string,
  ): Promise<void | null> {
    try {
      const allCommitmentsByCompressedZkpPublicKey: Commitment[] =
        await this.client.getCommitmentsByCompressedZkpPublicKey(
          listOfCompressedZkpPublicKey,
        );

      if (
        allCommitmentsByCompressedZkpPublicKey &&
        allCommitmentsByCompressedZkpPublicKey.length > 0
      ) {
        await exportFile(
          `${pathToExport}${fileName}`,
          convertObjectToString(allCommitmentsByCompressedZkpPublicKey),
        );
        return;
      }
      if (allCommitmentsByCompressedZkpPublicKey === null) {
        return null;
      }
      logger.warn(
        "Either you don't have any commitments for this listOfCompressedZkpPublicKey or this one is invalid!",
      );
      return null;
    } catch (err) {
      logger.child({ listOfCompressedZkpPublicKey }).error(err);
      return null;
    }
  }

  close() {
    logger.debug("User :: close");
    this.web3Websocket.close();
  }
}

export default User;
