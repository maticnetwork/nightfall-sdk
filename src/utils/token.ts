import fs from "fs";
import path from "path";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { TOKEN_ABIS, TOKEN_STANDARDS } from "./constants";
import logger from "./logger";

// TODO consider rm types
interface TokenOptions {
  web3: Web3;
  standard: string;
  contractAddress: string;
}

class Token {
  web3: Web3;
  tokenStandard: string;
  tokenContractAddress: string;

  tokenContract: Contract;
  tokenDecimals: number;
  tokenId: string;

  constructor(options: TokenOptions) {
    logger.debug({ options }, "new Token");
    this.web3 = options.web3;
    this.tokenStandard = options.standard;
    this.tokenContractAddress = options.contractAddress;

    this.init();
  }

  init() {
    this.setTokenContract();
  }

  setTokenContract() {
    logger.debug("Token :: setTokenContract");
    const _contractAbi = this.getContractAbi();
    this.tokenContract = new this.web3.eth.Contract(
      _contractAbi,
      this.tokenContractAddress,
    );
    logger.info({ tokenContract: this.tokenContract });
  }

  getContractAbi() {
    logger.debug("Token :: getContractAbi");
    const _rootPath = path.resolve();
    const _tokenAbi = TOKEN_ABIS[this.tokenStandard.toUpperCase()]; // TODO review
    const _tokenAbiPath = path.join(_rootPath, "src", "abis", _tokenAbi);
    logger.info({ path: _tokenAbiPath }, "Read contract file at");
    const _tokenAbiSource = fs.readFileSync(_tokenAbiPath, {
      encoding: "utf8",
    });
    return JSON.parse(_tokenAbiSource);
  }

  async setTokenDecimals() {
    logger.debug("Token :: setTokenDecimals");
    let _decimals: number;
    if (this.tokenStandard === TOKEN_STANDARDS.ERC20) {
      _decimals = Number(await this.tokenContract.methods.decimals().call());
    } else if (
      this.tokenStandard === TOKEN_STANDARDS.ERC165 ||
      this.tokenStandard === TOKEN_STANDARDS.ERC721 ||
      this.tokenStandard === TOKEN_STANDARDS.ERC1155
    ) {
      _decimals = 0;
    } else {
      logger.error("Unknown token standard");
    }
    this.tokenDecimals = _decimals;
    logger.info({ tokenDecimals: this.tokenDecimals }, "Token decimals");
  }

  // setTokenId() {}
}

export default Token;
