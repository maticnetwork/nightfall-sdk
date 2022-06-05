import axios, { AxiosResponse } from "axios";
import logger from "../libs/logger";

// TODO review/improve error handling
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
      if (res.status !== 200) throw new Error("Client unavailable");
      logger.info({ status: res.status, data: res.data });
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
      logger.info({ status: res.status, data: res.data });
    } catch (err) {
      logger.child({ contractName }).error(err);
      return null;
    }
    return res.data.address;
  }

  // TODO improve return types, double-check it's coherent with API response
  async generateZkpKeys(mnemonic: string, addressIndex: number) {
    const logObj = { mnemonic, addressIndex };
    logger.debug(logObj, "Calling client at generate-keys");
    let res: AxiosResponse;
    try {
      res = await axios.post(`${this.apiUrl}/generate-keys`, {
        mnemonic,
        path: `m/44'/60'/0'/${addressIndex}`,
      });
      logger.info({ status: res.status, data: res.data });
    } catch (err) {
      logger.child(logObj).error(err);
      return null;
    }
    return res.data;
  }

  // TODO check return, improve res + return types, double-check it's coherent with API response
  async subscribeToIncomingViewingKeys(zkpKeys: any) {
    logger.debug({ zkpKeys }, "Calling client at incoming-viewing-key");
    let res: AxiosResponse;
    try {
      res = await axios.post(`${this.apiUrl}/incoming-viewing-key`, {
        ivks: [zkpKeys.ivk],
        nsks: [zkpKeys.nsk],
      });
      logger.info({ status: res.status, data: res.data });
    } catch (err) {
      logger.child({ zkpKeys }).error(err);
      return null;
    }
    return res.data;
  }
}

export default Client;
