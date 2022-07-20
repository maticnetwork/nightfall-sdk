import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
// import type { Token } from "../tokens";
import { submitTransaction } from "./helpers/submit";
import type { TransactionReceipt } from "web3-core";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

export async function createAndSubmitApproval(
  token: any, // Token,
  ownerAddress: string,
  ownerPrivateKey: string,
  spenderAddress: string,
  value: string,
  fee: string,
  web3: Web3,
): Promise<void | null | TransactionReceipt> {
  logger.debug("createAndSubmitApproval");

  const unsignedTx = await token.approveTransaction(
    ownerAddress,
    spenderAddress,
    value,
  );
  // unsignedTx `null` signals that the approval is not required
  if (unsignedTx === null) return;
  logger.info({ unsignedTx }, "Approval tx, unsigned");

  let txReceipt: TransactionReceipt;
  try {
    txReceipt = await submitTransaction(
      ownerAddress,
      ownerPrivateKey,
      token.contractAddress,
      unsignedTx,
      fee,
      web3,
    );
  } catch (err) {
    logger.child({ unsignedTx }).error(err);
    return null;
  }
  return txReceipt;
}
