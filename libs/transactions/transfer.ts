import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
// import type { Token } from "../tokens";
import { submitTransaction } from "./helpers/submit";
import type { Client } from "../client";
import type { NightfallZkpKeys } from "../nightfall/types";
import type { TransactionReceipt } from "web3-core";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

export async function createAndSubmitTransfer(
  ercAddress: string,
  ercStandard: string,
  ownerAddress: string,
  ownerPrivateKey: string,
  ownerZkpKeys: NightfallZkpKeys,
  shieldContractAddress: string,
  value: string,
  fee: string,
  web3: Web3,
  client: Client,
  recipientAddress: string,
) {
  logger.debug("createAndSubmitTransfer");

  const resData = await client.transfer({
    ercAddress: ercAddress,
    recipientData: {
      values: [value],
      recipientCompressedZkpPublicKeys: [recipientAddress],
    },
    fee,
    offchain: false,
    rootKey: ownerZkpKeys.rootKey,
    tokenId: "0x00",
    tokenType: ercStandard,
  });

  // resData null signals that something went wrong in the Client
  if (resData === null) return;

  const unsignedTx = resData.txDataToSign;
  logger.debug({ unsignedTx }, "Transefr tx, unsigned");

  let txReceipt: TransactionReceipt;
  try {
    txReceipt = await submitTransaction(
      ownerAddress,
      ownerPrivateKey,
      shieldContractAddress,
      unsignedTx,
      fee,
      web3,
    );
  } catch (err) {
    logger.child({ unsignedTx }).error(err);
    return null;
  }
  return { txL1: txReceipt, txL2: resData.transaction };
}
