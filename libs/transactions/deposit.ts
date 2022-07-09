import Queue from "queue";
import Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
import { Token } from "../tokens";
import { submitTransaction } from "./helpers/submit";
import { toBaseUnit } from "./helpers/units";
import { Client } from "../client";
import type { NightfallZkpKeys } from "../nightfall/types";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

// TODO improve return type
export async function createAndSubmitDeposit(
  token: Token,
  ownerAddress: string,
  ownerPrivateKey: string,
  ownerZkpKeys: NightfallZkpKeys,
  shieldContractAddress: string,
  value: string,
  fee: number,
  web3: Web3,
  client: Client,
) {
  logger.debug("createAndSubmitDeposit");

  const resData = await client.deposit(token, ownerZkpKeys, value, fee);
  // resData null signals that something went wrong in the Client
  // hence we must reject the promise
  if (resData === null) return Promise.reject();
  logger.debug("***SOMETHING SOMETHING***"); // TODO update (:

  return submitTransaction(
    ownerAddress,
    ownerPrivateKey,
    shieldContractAddress,
    resData.txDataToSign,
    fee,
    web3,
  );
}
