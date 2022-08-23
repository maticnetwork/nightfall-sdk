import axios, { AxiosResponse } from "axios";
import type { Commitment } from "../nightfall/types";
import path from "path";
import { parentLogger } from "../utils";
import type { NightfallZkpKeys } from "../nightfall/types";
import type { RecipientNightfallData } from "libs/transactions/types";
import { NightfallSdkError } from "../utils/error";
import { TransactionResponseData } from "./types";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    logger.error(error);
    throw new NightfallSdkError(error.message);
  },
);

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
   * @returns {Promise<boolean>} True if API is alive, else false
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
   * Make GET request to get the address for a given contract name
   *
   * @async
   * @method getContractAddress
   * @param {string} contractName The name of the contract for which we need the address
   * @throws {NightfallSdkError} Bad response
   * @returns {Promise<string>} Eth contract address
   */
  async getContractAddress(contractName: string): Promise<string> {
    const endpoint = `contract-address/${contractName}`;
    logger.debug({ endpoint }, "Calling client at");

    const res = await axios.get(`${this.apiUrl}/${endpoint}`);
    logger.info(
      { status: res.status, data: res.data },
      `Client at ${endpoint} responded`,
    );

    return res.data.address;
  }

  /**
   * Perform a POST request at generate-zkp-keys to get a set of Zero-knowledge proof keys
   * given a valid mnemonic, and the addressIndex
   *
   * @method generateZkpKeysFromMnemonic
   * @param {string} validMnemonic A valid bip39 mnemonic
   * @param {number} addressIndex 0
   * @returns {Promise<null | NightfallZkpKeys>} A set of keys if request is successful, else null
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
   * @returns {Promise<null | string>} Status "success" if request is successful, else null
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

  /**
   * Make POST request to create a deposit transaction (tx)
   *
   * @async
   * @method deposit
   * @param {} token An instance of Token holding token data such as contract address
   * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
   * @param {string} value The amount in Wei of the token to be deposited
   * @param {string} fee The amount in Wei to pay a proposer for the tx
   * @throws {NightfallSdkError} Bad response
   * @returns {Promise<TransactionResponseData>}
   */
  async deposit(
    token: any,
    ownerZkpKeys: NightfallZkpKeys,
    value: string,
    fee: string,
  ): Promise<TransactionResponseData> {
    const endpoint = "deposit";
    logger.debug({ endpoint }, "Calling client at");

    const res = await axios.post(`${this.apiUrl}/${endpoint}`, {
      ercAddress: token.contractAddress,
      tokenType: token.ercStandard,
      tokenId: "0x00", // ISSUE #32 && ISSUE #58
      compressedZkpPublicKey: ownerZkpKeys.compressedZkpPublicKey,
      nullifierKey: ownerZkpKeys.nullifierKey,
      value,
      fee,
    });
    logger.info(
      { status: res.status, data: res.data },
      `Client at ${endpoint} responded`,
    );

    return res.data;
  }

  /**
   * Make POST request to create a transfer transaction (tx)
   *
   * @async
   * @method transfer
   * @param {} token An instance of Token holding token data such as contract address
   * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
   * @param {RecipientNightfallData} recipientNightfallData An object with [valueWei], [recipientCompressedZkpPublicKey]
   * @param {string} fee The amount in Wei to pay a proposer for the tx
   * @param {boolean} isOffChain If true, tx will be sent to the proposer's API (handled off-chain)
   * @throws {NightfallSdkError} No commitments found or bad response
   * @returns {Promise<TransactionResponseData>}
   */
  async transfer(
    token: any,
    ownerZkpKeys: NightfallZkpKeys,
    recipientNightfallData: RecipientNightfallData,
    fee: string,
    isOffChain: boolean,
  ): Promise<TransactionResponseData> {
    const endpoint = "transfer";
    logger.debug({ endpoint }, "Calling client at");

    const res = await axios.post(`${this.apiUrl}/${endpoint}`, {
      ercAddress: token.contractAddress,
      tokenId: "0x00", // ISSUE #32 && ISSUE #58
      rootKey: ownerZkpKeys.rootKey,
      recipientData: recipientNightfallData,
      fee,
      offchain: isOffChain,
    });
    logger.info(
      { status: res.status, data: res.data },
      `Client at ${endpoint} responded`,
    );

    if (res.data.error && res.data.error === "No suitable commitments") {
      throw new NightfallSdkError("No suitable commitments were found");
    }

    return res.data;
  }

  /**
   * Make POST request to create a withdrawal transaction (tx)
   *
   * @async
   * @method withdraw
   * @param {} token An instance of Token holding token data such as contract address
   * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
   * @param {string} value The amount in Wei of the token to be withdrawn
   * @param {string} fee The amount in Wei to pay a proposer for the tx
   * @param {boolean} isOffChain If true, tx will be sent to the proposer's API (handled off-chain)
   * @throws {NightfallSdkError} Bad response
   * @returns {Promise<TransactionResponseData>}
   */
  async withdraw(
    token: any,
    ownerZkpKeys: NightfallZkpKeys,
    value: string,
    fee: string,
    recipientEthAddress: string,
    isOffChain: boolean,
  ): Promise<TransactionResponseData> {
    const endpoint = "withdraw";
    logger.debug({ endpoint }, "Calling client at");

    const res = await axios.post(`${this.apiUrl}/${endpoint}`, {
      ercAddress: token.contractAddress,
      tokenType: token.ercStandard,
      tokenId: "0x00", // ISSUE #32 && ISSUE #58
      rootKey: ownerZkpKeys.rootKey,
      recipientAddress: recipientEthAddress,
      value,
      fee,
      offchain: isOffChain,
    });
    logger.info(
      { status: res.status, data: res.data },
      `Client at ${endpoint} responded`,
    );

    return res.data;
  }

  // DOCS find the L2 block containing the L2 transaction hash
  /**
   * Make POST request to finalise previously initiated withdrawal (tx)
   *
   * @async
   * @method finaliseWithdrawal
   * @param {string} withdrawTxHash Tx hash in Layer2 of the previously initiated withdrawal
   * @throws {NightfallSdkError} Bad response
   * @returns {Promise<TransactionResponseData>}
   */
  async finaliseWithdrawal(withdrawTxHash: string) {
    const endpoint = "finalise-withdrawal";
    logger.debug({ endpoint }, "Calling client at");

    const res = await axios.post(`${this.apiUrl}/${endpoint}`, {
      transactionHash: withdrawTxHash,
    });
    logger.info(
      { status: res.status, data: res.data },
      `Client at ${endpoint} responded`,
    );

    return res.data;
  }

  async getPendingDeposits(
    zkpKeys: NightfallZkpKeys,
    tokenContractAddresses: string[],
  ) {
    const endpoint = "commitment/pending-deposit";
    logger.debug({ endpoint }, "Calling client at");

    const res = await axios.get(`${this.apiUrl}/commitment/pending-deposit`, {
      params: {
        compressedZkpPublicKey: zkpKeys.compressedZkpPublicKey,
        ercList: tokenContractAddresses,
      },
    });
    logger.info(
      { status: res.status, data: res.data },
      `Client at ${endpoint} responded`,
    );

    return res.data.balance?.[zkpKeys.compressedZkpPublicKey];
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
    return res.data.balance;
  }

  /**
   * @method getLayer2PendingSpentBalances Make the call for the enpoint that is responsible to return
   * the balance of pending spent commitments from transfer and withdraw for each ERC address
   * @param {string[]} ercList - an array of ERC smart contracts
   * @param {boolean} shouldFilterByCompressedZkpPublicKey - a boolean value that will define in the endpoint if the query
   * should filter the pending spent balances by compressed zkp public key
   * @param {NightfallZkpKeys} zkpKeys - A set of Zero-knowledge proof keys
   * @returns {Promise} This promise resolves into an object whose properties are the
    addresses of the ERC contracts of the tokens held by this account in Layer 2. The
    value of each propery is the number of tokens pending spent (transfer & withdraw)
    from that contract. TODO review
   */
  async getPendingTransfers(zkpKeys: NightfallZkpKeys) {
    logger.debug("Calling client at commitment/pending-spent");
    let res: AxiosResponse;
    try {
      res = await axios.get(`${this.apiUrl}/commitment/pending-spent`, {
        params: {
          compressedZkpPublicKey: zkpKeys.compressedZkpPublicKey,
        },
      });
      logger.info(
        { status: res.status, data: res.data },
        "Client at commitment/pending-spent responded",
      );
    } catch (err) {
      logger.error(err);
      return null;
    }
    return res.data.balance?.[zkpKeys.compressedZkpPublicKey];
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
