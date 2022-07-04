import Joi from "joi";

const PATTERN_ETH_PRIVATE_KEY = /^0x[0-9a-f]{64}$/;
export const createOptions = Joi.object({
  blockchainWsUrl: Joi.string().required(),
  clientApiUrl: Joi.string().required(),
  ethereumPrivateKey: Joi.string().pattern(PATTERN_ETH_PRIVATE_KEY).required(),
  nightfallMnemonic: Joi.string(),
});
