import Queue from "queue";
import Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
import { Token } from "../tokens";
import { submitTransaction } from "./transactions";
import { toBaseUnit } from "./units";
import { Client } from "../client";
import type { NightfallZkpKeys } from "../nightfall/types";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

// TODO improve return type
async function setToken(
  tokenAddress: string,
  tokenStandard: string,
  web3: Web3,
): Promise<any> {
  logger.debug({ tokenAddress, tokenStandard }, "setToken");

  // TODO validate and format tokenAddress, tokenStandard
  const token = new Token({
    web3: web3,
    address: tokenAddress,
    standard: tokenStandard,
  });

  try {
    await token.init();
  } catch (err) {
    logger
      .child({ tokenAddress, tokenStandard })
      .error(err, "Error while initialising token");
    return null;
  }

  return token;
}

// TODO improve args, return type
export async function createDeposit(
  tokenAddress: string,
  tokenStandard: string,
  value: string,
  fee: number,
  shieldContractAddress: string,
  ethPrivateKey: string,
  ethAddress: string,
  zkpKeys: NightfallZkpKeys,
  web3: Web3,
  client: Client,
): Promise<any> {
  logger.debug({ tokenAddress }, "createDeposit"); // TODO review

  const userQueue = new Queue({ autostart: true, concurrency: 1 });
  // Set token TODO only if it's not set or is different
  const token = await setToken(tokenAddress, tokenStandard, web3);
  if (token === null) return null;
  logger.info(
    {
      address: token.contractAddress,
      standard: token.standard,
      decimals: token.decimals,
    },
    "Token is",
  );

  // TODO encapsulate toBaseUnit within try/catch
  // CHECK value is converted to wei, but what about fees?
  const _value = toBaseUnit(value.toString(), token.decimals, web3);
  logger.info({ _value }, "Value in wei is");

  // Approval start (tx1)
  const txApproval = await token.approveTransaction(
    ethAddress,
    shieldContractAddress,
    _value,
  );
  logger.info({ unsignedTx: txApproval }, "Approval tx, unsigned");
  if (txApproval !== null) {
    userQueue.push(async () => {
      try {
        const receipt1 = await submitTransaction(
          ethAddress,
          token.contractAddress,
          txApproval,
          fee,
          ethPrivateKey,
          web3,
        );
        logger.info({ receipt1 }, "Proof from tx 1");
      } catch (err) {
        logger.error(err);
      }
    });
    logger.info({ queue: userQueue }, "New tx 1 added");
  }
  // Approval end

  // Deposit start (tx2)
  const resData = await client.deposit(
    token.contractAddress,
    token.standard,
    _value,
    zkpKeys.pkd,
    zkpKeys.nsk,
    fee,
  );
  if (resData === null) return null;

  return new Promise((resolve, reject) => {
    userQueue.push(async () => {
      try {
        const receipt2 = await submitTransaction(
          ethAddress,
          shieldContractAddress,
          resData.txDataToSign,
          fee,
          ethPrivateKey,
          web3,
        );
        logger.info({ receipt2 }, "Proof from tx 2");
        resolve(receipt2);
      } catch (err) {
        logger.error(err);
        reject(err);
      }
    });
  });
}
