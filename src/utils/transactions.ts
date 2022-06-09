import axios from "axios";
import logger from "./logger";

const GAS = process.env.GAS || 4000000;
const GAS_PRICE = process.env.GAS_PRICE || "10000000000";
const GAS_ESTIMATE_ENDPOINT =
  process.env.GAS_ESTIMATE_ENDPOINT ||
  "https://vqxy02tr5e.execute-api.us-east-2.amazonaws.com/production/estimateGas";

const GAS_MULTIPLIER = Number(process.env.GAS_MULTIPLIER) || 2;
const GAS_PRICE_MULTIPLIER = Number(process.env.GAS_PRICE_MULTIPLIER) || 2;

async function estimateGas(contractAddress, unsignedTransaction) {
  let gasLimit;
  try {
    gasLimit = await this.web3.eth.estimateGas({
      from: this.ethereumAddress,
      to: contractAddress,
      data: unsignedTransaction,
    });
  } catch (error) {
    // logger.warn("estimateGas failed, falling back to constant value");
    gasLimit = GAS;
  }
  return Math.ceil(Number(gasLimit) * GAS_MULTIPLIER); // 50% seems a more than reasonable buffer.
}

async function estimateGasPrice() {
  let proposedGasPrice;
  try {
    // Call the endpoint to estimate the gas fee.
    const res = (await axios.get(GAS_ESTIMATE_ENDPOINT)).data.result;
    proposedGasPrice = Number(res?.ProposeGasPrice) * 10 ** 9;
  } catch (error) {
    // logger.warn("Gas Estimation Failed, using previous block gasPrice");
    // try {
    //   proposedGasPrice = Number(await this.web3.eth.getGasPrice());
    // } catch (err) {
    //   logger.warn(
    //     "Failed to get previous block gasprice. Falling back to default",
    //   );
    //   proposedGasPrice = GAS_PRICE;
    // }
  }
  return Math.ceil(proposedGasPrice * GAS_PRICE_MULTIPLIER);
}

export async function submitTransaction(
  unsignedTransaction,
  contractAddress = this.shieldContractAddress,
  fee = this.defaultFee,
) {
  // estimate the gasPrice
  const gasPrice = await estimateGasPrice();
  // Estimate the gasLimit
  const gas = await estimateGas(contractAddress, unsignedTransaction);

  logger.debug(
    `Transaction gasPrice was set at ${Math.ceil(
      gasPrice / 10 ** 9,
    )} GWei, gas limit was set at ${gas}`,
  );
  const tx = {
    from: this.ethereumAddress,
    to: contractAddress,
    data: unsignedTransaction,
    value: fee,
    gas,
    gasPrice,
  };

  // logger.debug(`The nonce for the unsigned transaction ${tx.data} is ${this.nonce}`);
  // this.nonce++;
  if (this.ethereumSigningKey) {
    const signed = await this.web3.eth.accounts.signTransaction(
      tx,
      this.ethereumSigningKey,
    );
    const promiseTest = new Promise((resolve, reject) => {
      this.web3.eth
        .sendSignedTransaction(signed.rawTransaction)
        .once("receipt", (receipt) => {
          logger.debug(
            `Transaction ${receipt.transactionHash} has been received.`,
          );
          resolve(receipt);
        })
        .on("error", (err) => {
          reject(err);
        });
    });
    return promiseTest;
  }
  return this.web3.eth.sendTransaction(tx);
}
