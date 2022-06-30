import Joi from "joi";

export const createOptions = Joi.object({
  blockchainWsUrl: Joi.string().required(),
  clientApiUrl: Joi.string().required(),
  ethereumPrivateKey: Joi.string().required(), // TODO consider hex validation vs isKeyHexStrict
  nightfallMnemonic: Joi.string(),
});
