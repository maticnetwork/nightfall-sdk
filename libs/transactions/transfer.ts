import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
import { submitTransaction } from "./helpers/submit";
import type { Client } from "../client";
import type { NightfallZkpKeys } from "../nightfall/types";
import type { TransactionReceipt } from "web3-core";
import { Transaction } from "libs/types";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

/**
 * @method handleTransfer handle the flow for transferences in layer2
 * @param {string} ercAddress - the address of the smart contract created for this token
 * @param {string} ercStandard - the erc standard
 * @param {string} ownerAddress - the address of who is doing the transfer
 * @param {string} ownerPrivateKey - the private key of the sender to sing the transaction
 * @param {NightfallZkpKeys} ownerZkpKeys - the zkp keys for the sender
 * @param {string} shieldContractAddress - the address of the Shield smart contract
 * @param {string} value - the value to be transfered
 * @param {string} fee - the amount (Wei) to pay a proposer for the transaction
 * is being taken.  Note that the Nightfall_3 State.sol contract must be approved
 * by the token's owner to be able to withdraw the token
 * @param {Web3} web3 - web3js instance
 * @param {Client} client -
 * @param {string} recipientAddress - the zkp public key of the recipient
 * @param {boolean} offchain - indicates if the transfer is onchain or offchain
 * @returns
 */
export async function handleTransfer(
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
  offchain: boolean,
): Promise<{ txL1: TransactionReceipt; txL2: Transaction }> | null {
  logger.debug("createAndSubmitTransfer");

  const transferResponseData = await client.transfer({
    ercAddress: ercAddress,
    recipientData: {
      values: [value],
      recipientCompressedZkpPublicKeys: [recipientAddress],
    },
    fee,
    offchain,
    rootKey: ownerZkpKeys.rootKey,
    tokenId: "0x00",
    tokenType: ercStandard,
  });

  // transferResponseData null signals that something went wrong in the Client
  if (transferResponseData === null) return null;

  if (!offchain) {
    const unsignedTx = transferResponseData.txDataToSign;
    logger.debug({ unsignedTx }, "Transefr tx, unsigned");

    let txReceipt: TransactionReceipt;
    try {
      txReceipt = await submitTransaction(
        ownerAddress,
        ownerPrivateKey,
        shieldContractAddress,
        unsignedTx,
        "0",
        web3,
      );
    } catch (err) {
      logger.child({ unsignedTx }).error(err);
      return null;
    }
    return { txL1: txReceipt, txL2: transferResponseData.transaction };
  }
}
