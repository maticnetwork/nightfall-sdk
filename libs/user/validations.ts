import Joi, { CustomHelpers } from "joi";
import { checkAddressChecksum } from "web3-utils";
import { TOKEN_STANDARDS } from "../tokens";

const isChecksum = (tokenAddress: string, helpers: CustomHelpers) => {
  const isValid = checkAddressChecksum(tokenAddress);
  if (!isValid) return helpers.error("Invalid checksum, review tokenAddress");
  return tokenAddress;
};

// See https://joi.dev/tester/
const PATTERN_ETH_PRIVATE_KEY = /^0x[0-9a-f]{64}$/;
export const createOptions = Joi.object({
  blockchainWsUrl: Joi.string().required(),
  clientApiUrl: Joi.string().required(),
  ethereumPrivateKey: Joi.string()
    .trim()
    .pattern(PATTERN_ETH_PRIVATE_KEY)
    .required(),
  nightfallMnemonic: Joi.string(),
});

export const makeDepositOptions = Joi.object({
  tokenAddress: Joi.string()
    .trim()
    .custom(isChecksum, "custom validation")
    .required(),
  tokenStandard: Joi.string()
    .trim()
    .uppercase()
    .valid(...Object.keys(TOKEN_STANDARDS))
    .required(),
  value: Joi.string().required(),
  feeWei: Joi.string(),
});

export const makeTransferOptions = Joi.object({
  tokenAddress: Joi.string()
    .trim()
    .custom(isChecksum, "custom validation")
    .required(),
  tokenStandard: Joi.string()
    .trim()
    .uppercase()
    .valid(...Object.keys(TOKEN_STANDARDS))
    .required(),
  value: Joi.string().required(),
  nightfallRecipientAddress: Joi.string().trim().required(), // ISSUE #76
  feeWei: Joi.string(),
  isOffChain: Joi.boolean(),
});

export const makeWithdrawalOptions = Joi.object({
  tokenAddress: Joi.string()
    .trim()
    .custom(isChecksum, "custom validation")
    .required(),
  tokenStandard: Joi.string()
    .trim()
    .uppercase()
    .valid(...Object.keys(TOKEN_STANDARDS))
    .required(),
  value: Joi.string().required(),
  ethRecipientAddress: Joi.string()
    .trim()
    .custom(isChecksum, "custom validation")
    .required(),
  feeWei: Joi.string(),
  isOffChain: Joi.boolean(),
});

export const finaliseWithdrawalOptions = Joi.object({
  withdrawTxHash: Joi.string(),
});
