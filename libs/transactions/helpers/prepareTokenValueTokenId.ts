import { TokenFactory, whichTokenStandard } from "../../tokens";
import type Web3 from "web3";
import { ERC20, ERC721 } from "../../tokens/constants";
import { TX_VALUE_DEFAULT, TX_TOKEN_ID_DEFAULT } from "../../user/constants";
import { stringValueToWei } from "./stringValueToWei";

// TODO DOCS
export async function prepareTokenValueTokenId(
  contractAddress: string,
  value: string,
  tokenId: string,
  web3: Web3,
) {
  // Missing logs ISSUE #33
  // Set value and tokenId defaults based on token ercStandard
  const ercStandard = await whichTokenStandard(contractAddress, web3);
  if (ercStandard === ERC20) tokenId = TX_TOKEN_ID_DEFAULT;
  if (ercStandard === ERC721) value = TX_VALUE_DEFAULT;

  // Set token
  const token = await TokenFactory.create({
    contractAddress,
    ercStandard,
    web3,
  });

  // Convert value to wei
  let valueWei = "0";
  if (value !== "0") {
    valueWei = stringValueToWei(value, token.decimals);
  }

  return { token, valueWei, tokenId };
}
