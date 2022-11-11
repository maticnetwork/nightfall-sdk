import axios from "axios";
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
    logger.error(error, "Client failed");
    throw new NightfallSdkError(error);
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
   * Make GET request to check that API is alive
   *
   * @method healthCheck
   * @throws {NightfallSdkError} Response other than 200 or bad response
   * @returns {Promise<boolean>} Should resolve `true` if API is alive, else `false`
   */
  async healthCheck(): Promise<boolean> {
    const endpoint = "healthcheck";
    logger.debug({ endpoint }, "Calling client at");

    const res = await axios.get(`${this.apiUrl}/${endpoint}`);
    if (res.status !== 200) {
      logger.error(res, "Client not available");
      throw new NightfallSdkError("Sorry, client not available");
    }
    logger.info(
      { status: res.status, data: res.data },
      `Client at ${endpoint} responded`,
    );

    return true;
  }

  /**
   * Make GET request to get the address for a given contract name
   *
   * @async
   * @method getContractAddress
   * @param {string} contractName The name of the contract for which we need the address
   * @throws {NightfallSdkError} Bad response
   * @returns {Promise<string>} Should resolve into Eth contract address
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
   * Make POST request to get a set of Zero-knowledge proof keys
   *
   * @method generateZkpKeysFromMnemonic
   * @param {string} validMnemonic A valid bip39 mnemonic
   * @param {number} addressIndex Pass `0` to generate the first account
   * @throws {NightfallSdkError} Bad response
   * @returns {Promise<NightfallZkpKeys>} Should resolve into a set of keys if request is successful
   */
  async generateZkpKeysFromMnemonic(
    validMnemonic: string,
    addressIndex: number,
  ): Promise<NightfallZkpKeys> {
    const endpoint = "generate-zkp-keys";
    logger.debug({ endpoint }, "Calling client at");

    const res = await axios.post(`${this.apiUrl}/${endpoint}`, {
      mnemonic: validMnemonic,
      addressIndex,
    });
    // Do NOT log res.data for privacy
    logger.info({ status: res.status }, `Client at ${endpoint} responded`);

    return res.data;
  }

  /**
   * Make POST request to subscribe to incoming viewing keys
   *
   * @method subscribeToIncomingViewingKeys
   * @param {NightfallZkpKeys} zkpKeys A set of Zero-knowledge proof keys
   * @throws {NightfallSdkError} Bad response
   * @returns {Promise<string>} Should resolve `string` (success) if request is successful
   */
  async subscribeToIncomingViewingKeys(
    zkpKeys: NightfallZkpKeys,
  ): Promise<string> {
    const endpoint = "incoming-viewing-key";
    logger.debug({ endpoint }, "Calling client at");

    const res = await axios.post(`${this.apiUrl}/${endpoint}`, {
      zkpPrivateKeys: [zkpKeys.zkpPrivateKey],
      nullifierKeys: [zkpKeys.nullifierKey],
    });
    logger.info(
      { status: res.status, data: res.data },
      `Client at ${endpoint} responded`,
    );

    return res.data;
  }

  /**
   * Make POST request to create a deposit transaction (tx)
   *
   * @async
   * @method deposit
   * @param {*} token An instance of Token holding token data such as contract address
   * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
   * @param {string} value The amount in Wei of the token to be deposited
   * @param {string} tokenId The tokenId of the token to be deposited
   * @param {string} fee The amount in Wei to pay a proposer for the tx
   * @throws {NightfallSdkError} Bad response
   * @returns {Promise<TransactionResponseData>}
   */
  async deposit(
    token: any,
    ownerZkpKeys: NightfallZkpKeys,
    value: string,
    tokenId: string,
    fee: string,
  ): Promise<TransactionResponseData> {
    const endpoint = "deposit";
    logger.debug({ endpoint }, "Calling client at");

    const res = await axios.post(`${this.apiUrl}/${endpoint}`, {
      ercAddress: token.contractAddress,
      tokenType: token.ercStandard,
      value,
      tokenId,
      compressedZkpPublicKey: ownerZkpKeys.compressedZkpPublicKey,
      nullifierKey: ownerZkpKeys.nullifierKey,
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
   * @param {*} token An instance of Token holding token data such as contract address
   * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
   * @param {RecipientNightfallData} recipientNightfallData An object with [valueWei], [recipientCompressedZkpPublicKey]
   * @param {string} tokenId The tokenId of the token to be transferred
   * @param {string} fee The amount in Wei to pay a proposer for the tx
   * @param {boolean} isOffChain If true, tx will be sent to the proposer's API (handled off-chain)
   * @throws {NightfallSdkError} No commitments found or bad response
   * @returns {Promise<TransactionResponseData>}
   */
  async transfer(
    token: any,
    ownerZkpKeys: NightfallZkpKeys,
    recipientNightfallData: RecipientNightfallData,
    tokenId: string,
    fee: string,
    isOffChain: boolean,
  ): Promise<TransactionResponseData> {
    const endpoint = "transfer";
    logger.debug({ endpoint }, "Calling client at");

    const res = await axios.post(`${this.apiUrl}/${endpoint}`, {
      offchain: isOffChain,
      ercAddress: token.contractAddress,
      tokenId,
      rootKey: ownerZkpKeys.rootKey,
      recipientData: recipientNightfallData,
      fee,
    });
    if (res.data.error && res.data.error === "No suitable commitments") {
      logger.error(res, "No suitable commitments were found");
      throw new NightfallSdkError("No suitable commitments were found");
    }
    logger.info(
      { status: res.status, data: res.data },
      `Client at ${endpoint} responded`,
    );

    return res.data;
  }

  /**
   * Make POST request to create a withdrawal transaction (tx)
   *
   * @async
   * @method withdraw
   * @param {*} token An instance of Token holding token data such as contract address
   * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
   * @param {string} value The amount in Wei of the token to be withdrawn
   * @param {string} tokenId The tokenId of the token to be withdrawn
   * @param {string} fee The amount in Wei to pay a proposer for the tx
   * @param {boolean} isOffChain If true, tx will be sent to the proposer's API (handled off-chain)
   * @throws {NightfallSdkError} Bad response
   * @returns {Promise<TransactionResponseData>}
   */
  async withdraw(
    token: any,
    ownerZkpKeys: NightfallZkpKeys,
    value: string,
    tokenId: string,
    fee: string,
    recipientEthAddress: string,
    isOffChain: boolean,
  ): Promise<TransactionResponseData> {
    const endpoint = "withdraw";
    logger.debug({ endpoint }, "Calling client at");

    const res = await axios.post(`${this.apiUrl}/${endpoint}`, {
      ercAddress: token.contractAddress,
      tokenType: token.ercStandard,
      rootKey: ownerZkpKeys.rootKey,
      recipientAddress: recipientEthAddress,
      value,
      tokenId,
      fee,
      offchain: isOffChain,
    });
    logger.info(
      { status: res.status, data: res.data },
      `Client at ${endpoint} responded`,
    );

    return res.data;
  }

  /**
   * Make POST request to finalise a previously initiated withdrawal (tx)
   *
   * @async
   * @method finaliseWithdrawal
   * @param {string} withdrawTxHashL2 Tx hash in Layer2 of the previously initiated withdrawal
   * @throws {NightfallSdkError} Bad response
   * @returns {Promise<TransactionResponseData>}
   */
  async finaliseWithdrawal(withdrawTxHashL2: string) {
    const endpoint = "finalise-withdrawal";
    logger.debug({ endpoint }, "Calling client at");

    const res = await axios.post(`${this.apiUrl}/${endpoint}`, {
      transactionHash: withdrawTxHashL2,
    });
    logger.info(
      { status: res.status, data: res.data },
      `Client at ${endpoint} responded`,
    );

    return res.data;
  }

  /**
   * Make GET request to get aggregated value for deposits that have not settled in L2 yet
   *
   * @async
   * @method getPendingDeposits
   * @param {NightfallZkpKeys} zkpKeys Sender's set of Zero-knowledge proof keys
   * @param {string[]} tokenContractAddresses A list of token addresses
   * @throws {NightfallSdkError} Bad response
   * @returns {*}
   */
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
    const endpoint = "commitment/balance";
    logger.debug({ endpoint }, "Calling client at");

    const res = await axios.get(`${this.apiUrl}/${endpoint}`, {
      params: {
        compressedZkpPublicKey: zkpKeys.compressedZkpPublicKey,
      },
    });
    logger.info(
      { status: res.status, data: res.data },
      `Client at ${endpoint} responded`,
    );

    return res.data.balance;
  }

  async getPendingTransfers(zkpKeys: NightfallZkpKeys) {
    const endpoint = "commitment/pending-spent";
    logger.debug({ endpoint }, "Calling client at");

    const res = await axios.get(`${this.apiUrl}/${endpoint}`, {
      params: {
        compressedZkpPublicKey: zkpKeys.compressedZkpPublicKey,
      },
    });
    logger.info(
      { status: res.status, data: res.data },
      `Client at ${endpoint} responded`,
    );

    return res.data.balance?.[zkpKeys.compressedZkpPublicKey];
  }

  /**
   * Make POST request to get all commitments filtered by many Nightfall addresses
   *
   * @method getCommitmentsByCompressedZkpPublicKey
   * @param {string[]} listOfCompressedZkpPublicKey list of compressedZkpPublicKeys (Nightfall address)
   * @throws {NightfallSdkError} No compressedZkpPublicKey given or bad response
   * @returns {Promise<Commitment[]>} Should resolve into a list of all existing commitments if request is successful
   */
  async getCommitmentsByCompressedZkpPublicKey(
    listOfCompressedZkpPublicKey: string[],
  ): Promise<Commitment[]> {
    const endpoint = "commitment/compressedZkpPublicKeys";
    logger.debug({ endpoint }, "Calling client at");

    if (!listOfCompressedZkpPublicKey.length) {
      logger.error(
        listOfCompressedZkpPublicKey,
        "You should pass at least one compressedZkpPublicKey",
      );
      throw new NightfallSdkError(
        "You should pass at least one compressedZkpPublicKey",
      );
    }
    const res = await axios.post(
      `${this.apiUrl}/${endpoint}`,
      listOfCompressedZkpPublicKey,
    );
    logger.info(
      { status: res.status, data: res.data },
      `Client at ${endpoint} responded`,
    );

    return res.data.commitmentsByListOfCompressedZkpPublicKey;
  }

  /**
   *
   * Make POST request to import a list of commitments
   *
   * @async
   * @method saveCommitments
   * @param {Commitment[]} listOfCommitments Commitments to be saved in the database
   * @throws {NightfallSdkError} Bad response
   * @return {Promise<string>} Should resolve `string` (successMessage)
   */
  async saveCommitments(listOfCommitments: Commitment[]) {
    const endpoint = "commitment/save";
    logger.debug({ endpoint }, "Calling client at");

    const res = await axios.post(
      `${this.apiUrl}/${endpoint}`,
      listOfCommitments,
    );
    logger.info(
      { status: res.status, data: res.data },
      `Client at ${endpoint} responded`,
    );

    return res.data;
  }

  /**
   *
   * Make GET request to verify if an address is whitelisted
   *
   * @async
   * @method isAddressWhitelisted
   * @param {string} ethAddress Ethereum address to verify if whitelisted
   * @throws {NightfallSdkError} Bad response
   * @return {Promise<boolean>} Should resolve `boolean` (successMessage)
   */
   async isAddressWhitelisted(ethAddress: string) {
    const endpoint = "whitelist/check";
    logger.debug({ endpoint }, "Calling client at");

    const res = await axios.get(`${this.apiUrl}/${endpoint}`, {
      params: {
        address: ethAddress
      },
    });

    logger.info(
      { status: res.status, data: res.data },
      `Client at ${endpoint} responded`,
    );

    return res.data.isWhitelisted;
  }

  /**
   *
   * Make POST request to add an address to the whitelist
   *
   * @async
   * @method addAddressToWhitelist
   * @param {string} address Ethereum address to add to whitelist
   * @throws {NightfallSdkError} Bad response
   * @return {Promise<string>} Should resolve `string` (successMessage)
   */
     async addAddressToWhitelist(address: string) {
      const endpoint = "whitelist/add";
      logger.debug({ endpoint }, "Calling client at");

      const res = await axios.post(`${this.apiUrl}/${endpoint}`, { 
        address,
      });

      logger.info(
        { status: res.status, data: res.data },
        `Client at ${endpoint} responded`,
      );

      return res.data;
    }

  /**
   *
   * Make POST request to removed an address from the whitelist
   *
   * @async
   * @method removeAddressFromWhitelist
   * @param {string} address Ethereum address to remove from whitelist
   * @throws {NightfallSdkError} Bad response
   * @return {Promise<string>} Should resolve `string` (successMessage)
   */
     async removeAddressFromWhitelist(address: string) {
      const endpoint = "whitelist/remove";
      logger.debug({ endpoint }, "Calling client at");

      const res = await axios.post(`${this.apiUrl}/${endpoint}`, { 
        address,
      });

      logger.info(
        { status: res.status, data: res.data },
        `Client at ${endpoint} responded`,
      );

      return res.data;
    }

  /**
   *
   * Make POST request to validate X509 certificate.
   * Validate a certificate (which will also add the user to the whitelist if the certificate is
   *  valid and the signature over their ethereum address checks out). The signature can be falsey if we 
   *  don't want to whitelist the address but are just validating the certificate.
   *  We might want to do this for an intermediate certificate for example.
   *
   * @async
   * @method validateCertificate
   * @param {string} certificate X509 certificate to validate
   * @param {Buffer} ethereumAddressSignature Signature of Ethereum address
   * @throws {NightfallSdkError} Bad response
   * @return {Promise<string>} Should resolve `string` (successMessage)
   */
     async validateCertificate(
       certificate: string,
       ethereumAddressSignature: Buffer 
     ) {
      const endpoint = "whitelist/validate";
      logger.debug({ endpoint }, "Calling client at");

      const res = await axios.post(`${this.apiUrl}/${endpoint}`, {
        certificate,
        ethereumAddressSignature,
      });

      logger.info(
        { status: res.status, data: res.data },
        `Client at ${endpoint} responded`,
      );

      return res.data;
    }

  /**
   *
   * Make GET request to verify if an address is Kycd
   *
   * @async
   * @method kycCheck
   * @param {string} ethAddress Ethereum address to verify if KYC
   * @throws {NightfallSdkError} Bad response
   * @return {Promise<boolean>} Should resolve `boolean` (successMessage)
   */
     async kycCheck(ethAddress: string) {
      const endpoint = "whitelist/kyc-check";
      logger.debug({ endpoint }, "Calling client at");
  
      const res = await axios.get(`${this.apiUrl}/${endpoint}`, {
        params: {
          address: ethAddress
        },
      });
  
      logger.info(
        { status: res.status, data: res.data },
        `Client at ${endpoint} responded`,
      );
  
      return res.data.isKyc;
    }

}

export default Client;
