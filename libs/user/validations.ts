import Joi, { ValidationError } from "joi";
import { NightfallSdkError } from "../utils/error";
import { TX_FEE_WEI_DEFAULT } from "./constants";

// See https://joi.dev/tester/

const PATTERN_ETH_PRIVATE_KEY = /^0x[0-9a-f]{64}$/;
export const createOptions = Joi.object({
  clientApiUrl: Joi.string().trim().required(),
  blockchainWsUrl: Joi.string().trim(),
  ethereumPrivateKey: Joi.string().trim().pattern(PATTERN_ETH_PRIVATE_KEY),
  nightfallMnemonic: Joi.string().trim(),
}).with("ethereumPrivateKey", "blockchainWsUrl");

const makeTransaction = Joi.object({
  tokenContractAddress: Joi.string().trim().required(),
  tokenErcStandard: Joi.string(), // keep it for a while for compatibility
  value: Joi.string(),
  tokenId: Joi.string(),
  feeWei: Joi.string().default(TX_FEE_WEI_DEFAULT),
}).or("value", "tokenId"); // these cannot have default

export const makeDepositOptions = makeTransaction;

export const makeTransferOptions = makeTransaction.append({
  recipientNightfallAddress: Joi.string().trim().required(),
  isOffChain: Joi.boolean().default(false),
});

export const makeWithdrawalOptions = makeTransaction.append({
  recipientEthAddress: Joi.string().trim().required(),
  isOffChain: Joi.boolean().default(false),
});

export const finaliseWithdrawalOptions = Joi.object({
  withdrawTxHashL2: Joi.string().trim(),
});

export const checkBalancesOptions = Joi.object({
  tokenContractAddresses: Joi.array().items(Joi.string().trim()),
});

export function isInputValid(error: ValidationError | undefined) {
  if (error !== undefined) {
    const message = error.details.map((e) => e.message).join();
    throw new NightfallSdkError(message);
  }
}
