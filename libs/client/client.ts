import axios, { AxiosResponse } from "axios";
import ICommitments from "libs/models/commitment";
import path from "path";
import { parentLogger } from "../utils";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

// TODO review/improve error handling, types
class Client {
  apiUrl: string;

  constructor(apiUrl: string) {
    logger.debug({ apiUrl }, "new Client at");
    this.apiUrl = apiUrl;
  }

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

  // TODO double-check that return is coherent with API response
  async generateZkpKeysFromMnemonic(
    validMnemonic: string,
    addressIndex: number,
  ) {
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

  // TODO double-check that return is coherent with API response
  async subscribeToIncomingViewingKeys(zkpKeys: any) {
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
    tokenAddress: string,
    tokenStandard: string,
    value: string,
    compressedZkpPublicKey: string,
    nullifierKey: string,
    fee: number,
  ) {
    const logInput = { tokenAddress, tokenStandard, value, fee };
    logger.debug(logInput, "Calling client at deposit");
    let res: AxiosResponse;
    try {
      res = await axios.post(`${this.apiUrl}/deposit`, {
        ercAddress: tokenAddress,
        tokenType: tokenStandard,
        tokenId: "0x00", // ISSUE #32
        value,
        compressedZkpPublicKey,
        nullifierKey,
        fee,
      });
      logger.info(
        { status: res.status, data: res.data },
        "Client at deposit responded",
      );
    } catch (err) {
      logger.child({ logInput }).error(err);
      return null;
    }
    return res.data;
  }

  /**
   *
   * @function getCommitmentsByCompressedZkpPublicKey does the communication with the nightfall client
   * endpoint to get all commitments by compressed pkd.
   * @param listOfCompressedZkpPublicKey a list of compressed zkp publick keys derivated from
   * the user mnemonic.
   * @returns all the commitments existent for this compressed pkds.
   * @author luizoamorim
   */
  async getCommitmentsByCompressedZkpPublicKey(
    listOfCompressedZkpPublicKey: string[],
  ): Promise<ICommitments[]> {
    try {
      if (
        listOfCompressedZkpPublicKey &&
        listOfCompressedZkpPublicKey.length > 0
      ) {
        const response = await axios.post(
          `${this.apiUrl}/commitment/byCompressedZkpPublicKey`,
          listOfCompressedZkpPublicKey,
        );

        console.log("RESPONSE: ", response);

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
