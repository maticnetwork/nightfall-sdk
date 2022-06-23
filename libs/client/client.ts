import axios, { AxiosResponse } from "axios";
import path from "path";
import { parentLogger } from "../utils";
import getCommitmentsAndExportFileUseCase from "../../useCases/GetCommitmentsAndExportFile/index";

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

  // TODO double-check that return is coherent with API response
  async generateZkpKeysFromMnemonic(
    validMnemonic: string,
    addressIndex: number,
  ) {
    const _logInput = { validMnemonic, addressIndex }; // TODO review internal vars underscore
    logger.debug(_logInput, "Calling client at generate-keys");
    let res: AxiosResponse;
    try {
      res = await axios.post(`${this.apiUrl}/generate-keys`, {
        mnemonic: validMnemonic,
        path: `m/44'/60'/0'/${addressIndex}`,
      });
      logger.info({ status: res.status, data: res.data });
    } catch (err) {
      logger.child(_logInput).error(err);
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

  async deposit(
    tokenAddress: string,
    tokenStandard: string,
    value: string,
    pkd: [],
    nsk: string,
    fee: number,
  ) {
    const _logInput = { tokenAddress, tokenStandard, value, pkd, nsk, fee };
    logger.debug(_logInput, "Calling client at deposit");
    let res: AxiosResponse;
    try {
      res = await axios.post(`${this.apiUrl}/deposit`, {
        ercAddress: tokenAddress,
        tokenType: tokenStandard,
        tokenId: "0x00", // TODO review when addressing issue #32 re other standards
        value,
        pkd,
        nsk,
        fee,
      });
      logger.info({ status: res.status, data: res.data });
    } catch (err) {
      logger.child({ _logInput }).error(err);
      return null;
    }
    return res.data;
  }

  async getCommitmentsAndExportFile(pathFileName: string) {
    getCommitmentsAndExportFileUseCase(pathFileName);
  }
}

export default Client;
