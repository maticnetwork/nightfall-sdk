import Joi, { CustomHelpers } from "joi";
import { checkAddressChecksum } from "web3-utils";
import { TOKEN_STANDARDS } from "../tokens";

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

const isChecksum = (tokenAddress: string, helpers: CustomHelpers) => {
  const isValid = checkAddressChecksum(tokenAddress);
  if (!isValid) return helpers.error("Invalid checksum, review tokenAddress");
  return tokenAddress;
};
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
  feeGwei: Joi.string(),
});

export const makeTransefrOptions = Joi.object({
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
  feeGwei: Joi.string(),
  recipientAddress: Joi.string()
    .trim()
    .custom(isChecksum, "custom validation")
    .required(),
});
