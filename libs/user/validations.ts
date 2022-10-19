import Joi, { CustomHelpers, ValidationError } from "joi";
import { NightfallSdkError } from "../utils/error";
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
  clientApiUrl: Joi.string().trim().required(),
  blockchainWsUrl: Joi.string().trim(),
  ethereumPrivateKey: Joi.string().trim().pattern(PATTERN_ETH_PRIVATE_KEY),
  nightfallMnemonic: Joi.string().trim(),
}).with("ethereumPrivateKey", "blockchainWsUrl");

//provide one or the other
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
  value: Joi.string(),
  tokenId: Joi.string(),
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
  withdrawTxHashL2: Joi.string(),
});

export const checkBalancesOptions = Joi.object({
  tokenContractAddresses: Joi.array().items(
    Joi.string().trim().custom(isChecksum, "custom validation"),
  ),
});

export function isInputValid(error: ValidationError | undefined) {
  if (error !== undefined) {
    const message = error.details.map((e) => e.message).join();
    throw new NightfallSdkError(message);
  }
}
