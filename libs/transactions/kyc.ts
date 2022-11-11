import type Web3 from "web3";
import path from "path";  
import crypto from 'crypto';
import { parentLogger } from "../utils";
// import type { Token } from "../tokens";
import { submitTransaction } from "./helpers/submit";
import type { Client } from "../client";
import type { TransactionReceipt } from "web3-core";
import type {
   EthereumTransactionReceipts }
from "./types";
import { NightfallSdkError } from "../utils/error";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

/**
 * Handle the flow to validate a X509 RSA certificate
 *
 * @async
 * @function createAndSubmitValidateCertificate
 * @param {string} ownerEthAddress Eth address performing the request. This address is the one 
 * whose private key is in the certificate.
 * @param {undefined | string} ownerEthPrivateKey Eth private key of the sender to sign the tx
 * @param {string} kycContractAddress Address of the KYC smart contract
 * @param {Web3} web3 web3js instance
 * @param {Client} client An instance of Client to interact with the API
 * @param {string} certificate path to certificated
 * @param {string} derPrivateKey der Private Key
 * @throws {NightfallSdkError} Error while broadcasting tx
 * @returns {Promise<EthereumTransactionReceipts>}
 */
export async function createAndSubmitValidateCertificate(
  ownerEthAddress: string,
  ownerEthPrivateKey: undefined | string,
  kycContractAddress: string,
  web3: Web3,
  client: Client,
  certificate: string,
  derPrivateKey: string,
): Promise<EthereumTransactionReceipts> {
  logger.debug("createAndSubmitValidateCertificate");

  // Sign the ethereum address
  let ethereumAddressSignature = null;
  if (derPrivateKey) {
    const privateKey = crypto.createPrivateKey({
      key: derPrivateKey,
      format: 'der',
      type: 'pkcs1',
    });

    ethereumAddressSignature = crypto.sign(
      'sha256',
      Buffer.from(ownerEthAddress.toLowerCase().slice(2), 'hex'),
       {
         key: privateKey,
         padding: crypto.constants.RSA_PKCS1_PADDING,
       },
    );
  } 

  // Validate certificate
  const resData = await client.validateCertificate(
    certificate,
    ethereumAddressSignature,
  );

  const unsignedTx = resData.txDataToSign;
  logger.debug({ unsignedTx }, "Validate Certificate tx, unsigned");

  let txReceipt: TransactionReceipt;
  try {
    txReceipt = await submitTransaction(
      ownerEthAddress,
      ownerEthPrivateKey,
      kycContractAddress,
      unsignedTx,
      web3,
    );
  } catch (err) {
    logger.child({ resData }).error(err, "Error when submitting transaction");
    throw new NightfallSdkError(err);
  }

  return { txReceipt };
}