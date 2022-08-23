import Joi, { CustomHelpers } from "joi";
import { checkAddressChecksum } from "web3-utils";
import { TOKEN_STANDARDS } from "../tokens";

const isChecksum = (ethAddress: string, helpers: CustomHelpers) => {
  const isValid = checkAddressChecksum(ethAddress);
  if (!isValid)
    return helpers.message({ custom: "Invalid checksum, review ethAddress" });
  return ethAddress;
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
  tokenContractAddress: Joi.string()
    .trim()
    .custom(isChecksum, "custom validation")
    .required(),
  tokenErcStandard: Joi.string()
    .trim()
    .uppercase()
    .valid(...Object.keys(TOKEN_STANDARDS))
    .required(),
  value: Joi.string().required(),
  feeWei: Joi.string(),
});

export const makeTransferOptions = Joi.object({
  tokenContractAddress: Joi.string()
    .trim()
    .custom(isChecksum, "custom validation")
    .required(),
  tokenErcStandard: Joi.string()
    .trim()
    .uppercase()
    .valid(...Object.keys(TOKEN_STANDARDS))
    .required(),
  value: Joi.string().required(),
  recipientNightfallAddress: Joi.string().trim().required(), // ISSUE #76
  feeWei: Joi.string(),
  isOffChain: Joi.boolean(),
});

export const makeWithdrawalOptions = Joi.object({
  tokenContractAddress: Joi.string()
    .trim()
    .custom(isChecksum, "custom validation")
    .required(),
  tokenErcStandard: Joi.string()
    .trim()
    .uppercase()
    .valid(...Object.keys(TOKEN_STANDARDS))
    .required(),
  value: Joi.string().required(),
  recipientEthAddress: Joi.string()
    .trim()
    .custom(isChecksum, "custom validation")
    .required(),
  feeWei: Joi.string(),
  isOffChain: Joi.boolean(),
});

export const finaliseWithdrawalOptions = Joi.object({
  withdrawTxHash: Joi.string(),
});

export const checkBalancesOptions = Joi.object({
  tokenContractAddresses: Joi.array().items(
    Joi.string().trim().custom(isChecksum, "custom validation"),
  ),
});
