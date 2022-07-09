import type Web3 from "web3";
import Token from "./token";
import path from "path";
import { parentLogger } from "../utils";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

export async function setToken(
  tokenAddress: string,
  tokenStandard: string,
  web3: Web3,
): Promise<null | Token> {
  logger.debug({ tokenAddress, tokenStandard }, "setToken");

  const token = new Token({
    address: tokenAddress,
    ercStandard: tokenStandard,
    web3: web3,
  });

  try {
    await token.setTokenDecimals();
  } catch (err) {
    logger
      .child({ tokenAddress, tokenStandard })
      .error(err, "Unable to set token decimals");
    return null;
  }

  return token;
}
