import axios, { AxiosResponse } from "axios";

// TODO review/improve error handling
class Client {
  apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await axios.get(`${this.apiUrl}/healthcheck`);
      if (res.status !== 200) throw new Error("Client unavailable");
    } catch (err) {
      console.error(err);
      return false;
    }
    return true;
  }

  async getContractAddress(contractName: string): Promise<null | string> {
    let res: AxiosResponse;
    try {
      res = await axios.get(`${this.apiUrl}/contract-address/${contractName}`);
    } catch (err) {
      console.error(err);
      return null;
    }
    return res.data.address;
  }

  // TODO improve return types, double-check it's coherent with API response
  async generateZkpKeys(mnemonic: string, addressIndex: number) {
    let res: AxiosResponse;
    try {
      res = await axios.post(`${this.apiUrl}/generate-keys`, {
        mnemonic,
        path: `m/44'/60'/0'/${addressIndex}`,
      });
    } catch (err) {
      console.error(err);
      return null;
    }
    return res.data;
  }

  // TODO check return, improve res + return types, double-check it's coherent with API response
  async subscribeToIncomingViewingKeys(zkpKeys: any) {
    let res;
    try {
      res = await axios.post(`${this.apiUrl}/incoming-viewing-key`, {
        ivks: [zkpKeys.ivk],
        nsks: [zkpKeys.nsk],
      });
    } catch (err) {
      console.error(err);
      return null;
    }
    return res.data;
  }
}

export default Client;
