import Web3 from "web3";
import path from "path";
import { parentLogger } from "../../utils";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

const GAS = process.env.GAS || 4000000;
const GAS_PRICE = process.env.GAS_PRICE || 10000000000;
const GAS_ESTIMATE_ENDPOINT =
  process.env.GAS_ESTIMATE_ENDPOINT ||
  "https://vqxy02tr5e.execute-api.us-east-2.amazonaws.com/production/estimateGas";

const GAS_MULTIPLIER = Number(process.env.GAS_MULTIPLIER) || 2;
const GAS_PRICE_MULTIPLIER = Number(process.env.GAS_PRICE_MULTIPLIER) || 2;

export async function submitTransaction(
  senderAddress: string,
  senderPrivateKey: string,
  receiverAddress: string,
  unsignedTx: any, // TODO improve
  fee: number,
  web3: Web3,
) {
  const logInput = {
    from: senderAddress,
    to: receiverAddress,
    unsignedTx,
    fee,
  };
  logger.debug({ logInput }, "submitTransaction");

  // Estimate gas
  const gas = Math.ceil(Number(GAS) * GAS_MULTIPLIER); // ISSUE #28
  const gasPrice = Math.ceil(Number(GAS_PRICE) * GAS_PRICE_MULTIPLIER); // ISSUE #28
  logger.debug(
    `Transaction gasPrice was set at ${Math.ceil(
      gasPrice / 10 ** 9,
    )} GWei, gas limit was set at ${gas}`,
  );

  const tx = {
    from: senderAddress,
    to: receiverAddress,
    data: unsignedTx,
    value: fee,
    gas,
    gasPrice,
  };

  const signedTx = await web3.eth.accounts.signTransaction(
    tx,
    senderPrivateKey,
  );
  return web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}
