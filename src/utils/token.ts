import fs from "fs";
import path from "path";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import logger from "./logger";
import { TokenOptions } from "../types/types";


// TODO review
const TOKEN_STANDARDS: { [key: string]: string } = {
  ERC20: "ERC20.json",
};

export const APPROVE_AMOUNT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

class Token {
  // constructor
  web3: Web3;
  contractAddress: string;
  standard: string;
  contract: Contract;

  // init
  decimals: number;

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
    const _abi = this.getContractAbi();
    this.contract = new this.web3.eth.Contract(_abi, this.contractAddress);
    logger.info("Token Contract ready");
  }

  getContractAbi() {
    logger.debug("Token :: getContractAbi");

    const _rootPath = path.resolve();
    const _abiFile = TOKEN_STANDARDS[this.standard];
    const _abiPath = path.join(_rootPath, "src", "abis", _abiFile);
    logger.info({ path: _abiPath }, "Read contract file at");

    const _abi = fs.readFileSync(_abiPath, { encoding: "utf8" });
    return JSON.parse(_abi);
  }

  // TODO support other token standards (issue #32)
  // CHECK that ERC165 is deployed to ganache
  async setTokenDecimals() {
    logger.debug("Token :: setTokenDecimals");
    const _decimals = Number(await this.contract.methods.decimals().call());
    this.decimals = _decimals;
    logger.info({ tokenDecimals: this.decimals }, "Token decimals");
  }

  // TODO support other token standards (issue #32)
  // TODO can this throw Errors?
  async approveTransaction(owner: string, spender: string, value: string) {
    const _logInput = { owner, spender, value };
    logger.debug({ _logInput }, "Token :: approveTransaction");

    const _allowance = await this.contract.methods
      .allowance(owner, spender)
      .call();
    logger.debug({ _allowance }, "Token allowance is");

    const _allowanceBN = this.web3.utils.toBN(_allowance);
    const _valueBN = this.web3.utils.toBN(value);
    logger.info({ _allowanceBN, _valueBN }, "ERC allowance vs tx value");

    // FYI When tx value is bigger than the spender allowance, will require approval
    if (_allowanceBN.lt(_valueBN)) {
      return this.contract.methods.approve(spender, APPROVE_AMOUNT).encodeABI(); // CHECK const
    }

    return null;
  }
}

export default Token;
