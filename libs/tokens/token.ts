import fs from "fs";
import path from "path";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { parentLogger } from "../utils";
import { TOKEN_STANDARDS, ABIS_PATH, APPROVE_AMOUNT } from "./constants";
import { TokenOptions } from "./types";
import { constructorOptions } from "./validations";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

class Token {
  // Set by constructor
  web3: Web3;
  contractAddress: string;
  standard: string;
  contract: Contract;

  // Set by init
  decimals: number;

  constructor(options: TokenOptions) {
    logger.debug("new Token");
    constructorOptions.validate(options);

    this.web3 = options.web3;
    this.contractAddress = options.address;
    this.standard = options.standard.toUpperCase();

    this.setTokenContract();
  }

  async init() {
    logger.debug("Token :: init");
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
    const _abiPath = path.join(_rootPath, ABIS_PATH, _abiFile);
    logger.info({ path: _abiPath }, "Read contract file at");

    const _abi = fs.readFileSync(_abiPath, { encoding: "utf8" });
    return JSON.parse(_abi);
  }

  // ISSUE #32
  // CHECK that ERC165 is deployed to ganache
  async setTokenDecimals() {
    logger.debug("Token :: setTokenDecimals");
    this.decimals = Number(await this.contract.methods.decimals().call());
    logger.info({ tokenDecimals: this.decimals }, "Token decimals");
  }

  // ISSUE #32
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

    // When tx value is bigger than the spender allowance, will require approval
    if (_allowanceBN.lt(_valueBN)) {
      return this.contract.methods.approve(spender, APPROVE_AMOUNT).encodeABI(); // CHECK const
    }

    return null;
  }
}

export default Token;
