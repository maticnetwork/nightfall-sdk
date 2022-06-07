import fs from "fs";
import path from "path";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import logger from "./logger";
import { TokenOptions } from "../types/types";

class Token {
  web3: Web3;
  name: string;
  contractAbi: string;
  contractAddress: string;

  contract: Contract;
  // tokenDecimals: number;
  // tokenId: string;

  constructor(options: TokenOptions) {
    logger.debug("new Token");
    this.web3 = options.web3;
    this.name = options.name;
    this.contractAbi = options.config.contractAbi;
    this.contractAddress = options.config.contractAddress;

    this.init();
  }

  init() {
    this.setTokenContract();
  }

  setTokenContract() {
    logger.debug("Token :: setTokenContract");
    const _contractAbi = this.getContractAbi();
    this.contract = new this.web3.eth.Contract(
      _contractAbi,
      this.contractAddress,
    );
    logger.info("Token Contract ready");
  }

  getContractAbi() {
    logger.debug("Token :: getContractAbi");
    const _rootPath = path.resolve();
    const _tokenAbiPath = path.join(_rootPath, "src", "abis", this.contractAbi);
    logger.info({ path: _tokenAbiPath }, "Read contract file at");
    const _tokenAbiSource = fs.readFileSync(_tokenAbiPath, {
      encoding: "utf8",
    });
    return JSON.parse(_tokenAbiSource);
  }

  // TODO check that ERC165 is deployed
  // async setTokenDecimals() {
  //   logger.debug("Token :: setTokenDecimals");
  //   let _decimals: number;
  //   if (this.tokenStandard === TOKEN_STANDARDS.ERC20) {
  //     _decimals = Number(await this.tokenContract.methods.decimals().call());
  //   } else if (
  //     this.tokenStandard === TOKEN_STANDARDS.ERC165 ||
  //     this.tokenStandard === TOKEN_STANDARDS.ERC721 ||
  //     this.tokenStandard === TOKEN_STANDARDS.ERC1155
  //   ) {
  //     _decimals = 0;
  //   } else {
  //     logger.error("Unknown token standard");
  //   }
  //   this.tokenDecimals = _decimals;
  //   logger.info({ tokenDecimals: this.tokenDecimals }, "Token decimals");
  // }

  // setTokenId() {}
}

export default Token;
