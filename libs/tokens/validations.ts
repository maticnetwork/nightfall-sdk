import path from "path";
import Web3 from "web3";
import { parentLogger } from "../utils";
import { TOKEN_STANDARDS } from "./constants";
import { TokenOptions } from "./types";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

function validateWeb3Arg(web3: Web3) {
  if (web3 === null || web3 === undefined)
    throw new Error("web3 missing in constructor args");
}

function validateAddressArg(contractAddress: string) {
  // What about checksum, should this be done here?
  if (
    contractAddress === null ||
    contractAddress === undefined ||
    contractAddress === ""
  ) {
    throw new Error("address missing in constructor args");
  }
}

function validateStandardArg(tokenStandard: string) {
  if (
    tokenStandard === null ||
    tokenStandard === undefined ||
    tokenStandard === ""
  ) {
    throw new Error("standard missing in constructor args");
  }

  // Does this go here?
  if (!Object.keys(TOKEN_STANDARDS).includes(tokenStandard.toUpperCase())) {
    throw new Error("standard is not valid");
  }
}

export function validateConstructorOptions(options: TokenOptions) {
  logger.debug("validateConstructorOptions");
  validateWeb3Arg(options.web3);

  validateAddressArg(options.address);

  validateStandardArg(options.standard);
}
