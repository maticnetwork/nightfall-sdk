import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
import { Token } from "../tokens";
import { submitTransaction } from "./helpers/submit";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

// TODO improve return type
export async function createAndSubmitApproval(
  token: Token,
  ownerAddress: string,
  ownerPrivateKey: string,
  spenderAddress: string,
  value: string,
  fee: number,
  web3: Web3,
) {
  logger.debug("createAndSubmitApproval");

  const unsignedTx = await token.approveTransaction(
    ownerAddress,
    spenderAddress,
    value,
  );
  // unsignedTx null signals that the approval is not required
  // hence we can resolve the promise
  if (unsignedTx === null) return Promise.resolve("pepe");
  logger.info("Tx approved");

  return submitTransaction(
    ownerAddress,
    ownerPrivateKey,
    token.contractAddress,
    unsignedTx,
    fee,
    web3,
  );
}
