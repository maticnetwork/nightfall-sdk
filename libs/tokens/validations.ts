import Joi from "joi";
import { TOKEN_STANDARDS } from "./constants";

// See https://joi.dev/tester/
export const constructorOptions = Joi.object({
  web3: Joi.object().required(),
  address: Joi.string().required(),
  standard: Joi.string()
    .uppercase()
    .valid(...Object.keys(TOKEN_STANDARDS))
    .required(),
});
