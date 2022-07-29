import axios, { AxiosResponse } from "axios";
import Commitment from "libs/types";
import path from "path";
import { parentLogger } from "../utils";
import type { NightfallZkpKeys } from "../nightfall/types";
// import type { Token } from "../tokens";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

/**
 * Creates a new Client
 *
 * @class Client
 */
class Client {
  /**
   * @property {string} apiUrl client address
   */
  apiUrl: string;

  /**
   * Client constructor
   *
   * @param  {string} apiUrl client address
   */
  constructor(apiUrl: string) {
    logger.debug({ apiUrl }, "new Client at");
    this.apiUrl = apiUrl;
  }

  /**
   * Perform a GET request at healthcheck to check that API is alive
   *
   * @method healthCheck
   * @return {Promise<boolean>} True if API is alive, else false
   */
  async healthCheck(): Promise<boolean> {
    logger.debug("Calling client at healthcheck");
    let res: AxiosResponse;
    try {
      res = await axios.get(`${this.apiUrl}/healthcheck`);
      if (res.status !== 200) {
        logger.error(
          { status: res.status },
          "Client unavailable, healthcheck status is",
        );
        return false;
      }
      logger.info(
        { status: res.status, data: res.data },
        "Client at healthcheck responded",
      );
    } catch (err) {
      logger.error(err);
      return false;
    }
    return true;
  }

  /**
   * Perform a GET request at contract-address to get this data for a given contract name
   *
   * @method getContractAddress
   * @param {string} contractName The name of the contract for which we need the address
   * @return {Promise<null | string>} Address if request is successful, else null
   */
  async getContractAddress(contractName: string): Promise<null | string> {
    logger.debug({ contractName }, "Calling client at contract-address");
    let res: AxiosResponse;
    try {
      res = await axios.get(`${this.apiUrl}/contract-address/${contractName}`);
      logger.info(
        { status: res.status, data: res.data },
        "Client at contract-address responded",
      );
    } catch (err) {
      logger.child({ contractName }).error(err);
      return null;
    }
    return res.data.address;
  }

  /**
   * Perform a POST request at generate-zkp-keys to get a set of Zero-knowledge proof keys
   * given a valid mnemonic, and the addressIndex
   *
   * @method generateZkpKeysFromMnemonic
   * @param {string} validMnemonic A valid bip39 mnemonic
   * @param {number} addressIndex 0
   * @return {Promise<null | NightfallZkpKeys>} A set of keys if request is successful, else null
   */
  async generateZkpKeysFromMnemonic(
    validMnemonic: string,
    addressIndex: number,
  ): Promise<null | NightfallZkpKeys> {
    const logInput = { validMnemonic, addressIndex };
    logger.debug(logInput, "Calling client at generate-zkp-keys");
    let res: AxiosResponse;
    try {
      res = await axios.post(`${this.apiUrl}/generate-zkp-keys`, {
        mnemonic: validMnemonic,
        addressIndex,
      });
      logger.info(
        { status: res.status, data: res.data },
        "Client at generate-zkp-keys responded",
      );
    } catch (err) {
      logger.child(logInput).error(err);
      return null;
    }
    return res.data;
  }

  /**
   * Perform a POST request to subscribe to incoming viewing keys
   *
   * @method subscribeToIncomingViewingKeys
   * @param {NightfallZkpKeys} zkpKeys A set of Zero-knowledge proof keys
   * @return {Promise<null | string>} Status "success" if request is successful, else null
   */
  async subscribeToIncomingViewingKeys(
    zkpKeys: NightfallZkpKeys,
  ): Promise<null | string> {
    logger.debug({ zkpKeys }, "Calling client at incoming-viewing-key");
    let res: AxiosResponse;
    try {
      res = await axios.post(`${this.apiUrl}/incoming-viewing-key`, {
        zkpPrivateKeys: [zkpKeys.zkpPrivateKey],
        nullifierKeys: [zkpKeys.nullifierKey],
      });
      logger.info(
        { status: res.status, data: res.data },
        "Client at incoming-viewing-key responded",
      );
    } catch (err) {
      logger.child({ zkpKeys }).error(err);
      return null;
    }
    return res.data;
  }

  async deposit(
    token: any, // Token,
    zkpKeys: NightfallZkpKeys,
    value: string,
    fee: string,
  ) {
    logger.debug("Calling client at deposit");
    let res: AxiosResponse;
    try {
      res = await axios.post(`${this.apiUrl}/deposit`, {
        ercAddress: token.contractAddress,
        tokenType: token.ercStandard,
        tokenId: "0x00", // ISSUE #32 && ISSUE #58
        value,
        compressedZkpPublicKey: zkpKeys.compressedZkpPublicKey,
        nullifierKey: zkpKeys.nullifierKey,
        fee,
      });
      logger.info(
        { status: res.status, data: res.data },
        "Client at deposit responded",
      );
    } catch (err) {
      logger.error(err);
      return null;
    }
    return res.data;
  }

  async withdraw(
    isOffChain: boolean,
    token: any, // Token,
    zkpKeys: NightfallZkpKeys,
    value: string,
    fee: string,
    recipientAddress: string,
  ) {
    logger.debug("Calling client at withdraw");
    let res: AxiosResponse;
    try {
      res = await axios.post(`${this.apiUrl}/withdraw`, {
        offchain: isOffChain,
        ercAddress: token.contractAddress,
        tokenType: token.ercStandard,
        tokenId: "0x00", // ISSUE #32 && ISSUE #58
        value,
        rootKey: zkpKeys.rootKey,
        fee,
        recipientAddress,
      });
      logger.info(
        { status: res.status, data: res.data },
        "Client at withdraw responded",
      );
    } catch (err) {
      logger.error(err);
      return null;
    }
    return res.data;
  }

  // DOCS find the L2 block containing the L2 transaction hash
  async finaliseWithdrawal(withdrawTxHash: string) {
    logger.debug("Calling client at finalise-withdrawal");
    let res: AxiosResponse;
    try {
      res = await axios.post(`${this.apiUrl}/finalise-withdrawal`, {
        transactionHash: withdrawTxHash,
      });
      logger.info(
        { status: res.status, data: res.data },
        "Client at withdraw responded",
      );
    } catch (err) {
      logger.error(err);
      return null;
    }
    return res.data;
  }

  async getPendingDeposits(zkpKeys: NightfallZkpKeys) {
    logger.debug("Calling client at commitment/pending-deposit");
    let res: AxiosResponse;
    try {
      res = await axios.get(`${this.apiUrl}/commitment/pending-deposit`, {
        params: {
          compressedZkpPublicKey: zkpKeys.compressedZkpPublicKey,
        },
      });
      logger.info(
        { status: res.status, data: res.data },
        "Client at commitment/pending-deposit responded",
      );
    } catch (err) {
      logger.error(err);
      return null;
    }
    return res.data;
  }

  async getNightfallBalances(zkpKeys: NightfallZkpKeys) {
    logger.debug("Calling client at commitment/balance");
    let res: AxiosResponse;
    try {
      res = await axios.get(`${this.apiUrl}/commitment/balance`, {
        params: {
          compressedZkpPublicKey: zkpKeys.compressedZkpPublicKey,
        },
      });
      logger.info(
        { status: res.status, data: res.data },
        "Client at commitment/balance responded",
      );
    } catch (err) {
      logger.error(err);
      return null;
    }
    return res.data;
  }

  /**
   *
   * @method getCommitmentsByCompressedZkpPublicKey does the communication with the nightfall client
   * endpoint to get all commitments by compressed pkd.
   * @param listOfCompressedZkpPublicKey a list of compressed zkp publick keys derivated from
   * the user mnemonic.
   * @returns all the commitments existent for this compressed pkds.
   * @author luizoamorim
   */
  async getCommitmentsByCompressedZkpPublicKey(
    listOfCompressedZkpPublicKey: string[],
  ): Promise<Commitment[]> {
    try {
      if (
        listOfCompressedZkpPublicKey &&
        listOfCompressedZkpPublicKey.length > 0
      ) {
        const response = await axios.post(
          `${this.apiUrl}/commitment/compressedZkpPublicKeys`,
          listOfCompressedZkpPublicKey,
        );

        return response.data.commitmentsByListOfCompressedZkpPublicKey;
      }
      throw new Error("You should pass at least one compressedZkpPublicKey");
    } catch (err) {
      logger.child({ listOfCompressedZkpPublicKey }).error(err);
      return null;
    }
  }
}

export default Client;
