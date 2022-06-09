import fs from "fs";
import path from "path";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import logger from "./logger";
import { TokenOptions } from "../types/types";

const TOKEN_STANDARDS: { [key: string]: string } = {
  ERC20: "ERC20.json",
};

class Token {
  // constructor
  web3: Web3;
  contractAddress: string;
  standard: string;
  contract: Contract;

  // init
  decimals: number;
  id: string;

  constructor(options: TokenOptions) {
    logger.debug("new Token");
    this.web3 = options.web3;
    this.contractAddress = options.address;
    this.standard = options.standard;

    this.setTokenContract();
  }

  async init() {
    await this.setTokenDecimals();
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
    const _contractAbiFile = TOKEN_STANDARDS[this.standard];
    const _contractAbiPath = path.join(
      _rootPath,
      "src",
      "abis",
      _contractAbiFile,
    );
    logger.info({ path: _contractAbiPath }, "Read contract file at");
    const _contractAbi = fs.readFileSync(_contractAbiPath, {
      encoding: "utf8",
    });
    return JSON.parse(_contractAbi);
  }

  // TODO check that ERC165 is deployed
  async setTokenDecimals() {
    logger.debug("Token :: setTokenDecimals");
    let _decimals: number;
    if (this.standard === TOKEN_STANDARDS.ERC20) {
      _decimals = Number(await this.contract.methods.decimals().call());
    } else _decimals = 0;
    this.decimals = _decimals;
    logger.info({ tokenDecimals: this.decimals }, "Token decimals");
  }

  async approveTransaction(
    ownerAddress: string,
    spenderAddress: string,
    value,
  ) {
    logger.debug("Token :: approveTransaction");
    if (this.standard === TOKEN_STANDARDS.ERC20) {
      await this.approveErc20Transaction(ownerAddress, spenderAddress, value);
    }
    // else TODO
  }

  // TODO needs to return boolean
  // TODO review allowance, and approve (ERC ERC)
  async approveErc20Transaction(
    ownerAddress: string,
    spenderAddress: string,
    value: any,
  ) {
    const _allowance = await this.contract.methods
      .allowance(ownerAddress, spenderAddress)
      .call();
    const _allowanceBN = this.web3.utils.toBN(_allowance);
    const _valueBN = this.web3.utils.toBN(value);
    if (_allowanceBN.lt(_valueBN)) {
      this.contract.methods.approve(spenderAddress).encodeABI();
    }
  }
}

export default Token;
