import axios from "axios";
import Web3 from "web3";
import logger from "./logger";

const GAS = process.env.GAS || 4000000;
const GAS_PRICE = process.env.GAS_PRICE || 10000000000;
const GAS_ESTIMATE_ENDPOINT =
  process.env.GAS_ESTIMATE_ENDPOINT ||
  "https://vqxy02tr5e.execute-api.us-east-2.amazonaws.com/production/estimateGas";

const GAS_MULTIPLIER = Number(process.env.GAS_MULTIPLIER) || 2;
const GAS_PRICE_MULTIPLIER = Number(process.env.GAS_PRICE_MULTIPLIER) || 2;

// async function estimateGas(contractAddress, unsignedTransaction) {
//   let gasLimit;
//   try {
//     gasLimit = await this.web3.eth.estimateGas({
//       from: this.ethereumAddress,
//       to: contractAddress,
//       data: unsignedTransaction,
//     });
//   } catch (error) {
//     logger.warn(`estimateGas failed. Falling back to constant value`);
//     gasLimit = GAS; // backup if estimateGas failed
//   }
//   return Math.ceil(Number(gasLimit) * GAS_MULTIPLIER); // 50% seems a more than reasonable buffer.
// }

// async function estimateGasPrice() {
//   let proposedGasPrice;
//   try {
//     // Call the endpoint to estimate the gas fee.
//     const res = (await axios.get(GAS_ESTIMATE_ENDPOINT)).data.result;
//     proposedGasPrice = Number(res?.ProposeGasPrice) * 10 ** 9;
//   } catch (error) {
//     logger.warn("Gas Estimation Failed, using previous block gasPrice");
//     try {
//       proposedGasPrice = Number(await this.web3.eth.getGasPrice());
//     } catch (err) {
//       logger.warn(
//         "Failed to get previous block gasprice.  Falling back to default",
//       );
//       proposedGasPrice = GAS_PRICE;
//     }
//   }
//   return Math.ceil(proposedGasPrice * GAS_PRICE_MULTIPLIER);
// }

export async function submitTransaction(
  ethereumAddress: string,
  contractAddress: string,
  unsignedTransaction: any,
  fee: number,
  ethereumPrivateKey: string,
  web3: Web3,
): Promise<any> {
  const _logInput = {
    from: ethereumAddress,
    to: contractAddress,
    unsignedTx: unsignedTransaction,
    fee,
  };
  logger.debug({ _logInput }, "X :: submitTransaction");

  // estimate the gasPrice
  const gasPrice = Math.ceil(Number(GAS_PRICE) * GAS_PRICE_MULTIPLIER); // TODO restore `estimateGasPrice` above (issue #28);
  // Estimate the gasLimit
  const gas = Math.ceil(Number(GAS) * GAS_MULTIPLIER); // TODO restore `estimateGas` (issue #28);
  logger.debug(
    `Transaction gasPrice was set at ${Math.ceil(
      gasPrice / 10 ** 9,
    )} GWei, gas limit was set at ${gas}`,
  );

  // const nonce = await web3.eth.getTransactionCount(ethereumAddress, "pending");

  const tx = {
    from: ethereumAddress,
    to: contractAddress,
    data: unsignedTransaction,
    value: fee,
    gas,
    gasPrice,
  };

  const signedTx = await web3.eth.accounts.signTransaction(
    tx,
    ethereumPrivateKey,
  );
  return web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}
