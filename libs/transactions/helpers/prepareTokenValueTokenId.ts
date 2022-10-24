import path from "path";
import { TokenFactory, whichTokenStandard } from "../../tokens";
import type Web3 from "web3";
import { ERC20, ERC721 } from "../../tokens/constants";
import { TX_VALUE_DEFAULT, TX_TOKEN_ID_DEFAULT } from "../../user/constants";
import { stringValueToWei } from "./stringValueToWei";
import { parentLogger } from "../../utils";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

/**
 * Determine ERC standard
 * Set value/tokenId defaults
 * Create an instance of Token
 * Convert value to Wei if needed
 *
 * @function whichTokenStandard
 * @param {string} contractAddress
 * @param {Web3} web3
 * @returns {string} "ERC20" | "ERC721" | "ERC1155"
 */
export async function prepareTokenValueTokenId(
  contractAddress: string,
  value: string,
  tokenId: string,
  web3: Web3,
) {
  logger.debug("prepareTokenValueTokenId");

  // Determine ERC standard
  const ercStandard = await whichTokenStandard(contractAddress, web3);

  // Set value/tokenId defaults based on token ERC standard
  if (ercStandard === ERC20) tokenId = TX_TOKEN_ID_DEFAULT;
  if (ercStandard === ERC721) value = TX_VALUE_DEFAULT;

  // Create an instance of Token
  const token = await TokenFactory.create({
    contractAddress,
    ercStandard,
    web3,
  });

  // Convert value to Wei if needed
  let valueWei = "0";
  if (value !== "0") {
    valueWei = stringValueToWei(value, token.decimals);
  }

  logger.debug({ valueWei, tokenId }, "Final value[Wei], tokenId");
  return { token, valueWei, tokenId };
}
