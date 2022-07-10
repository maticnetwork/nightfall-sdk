import fs from "fs";
import path from "path";
import Web3 from "web3";
import type { Contract } from "web3-eth-contract";
import { parentLogger } from "../utils";
import { TOKEN_STANDARDS, ABIS_PATH, APPROVE_AMOUNT } from "./constants";
import type { TokenOptions } from "./types";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

class Token {
  // Set by constructor
  web3: Web3;
  contractAddress: string;
  ercStandard: string;
  contract: Contract;

  // Set by setTokenDecimals
  decimals: number;

  constructor(options: TokenOptions) {
    logger.debug("new Token");

    this.web3 = options.web3;
    this.contractAddress = options.address;
    this.ercStandard = options.ercStandard.toUpperCase();
    logger.info(
      {
        address: this.contractAddress,
        ercStandard: this.ercStandard,
      },
      "Token is",
    );

    this.setTokenContract();
  }

  setTokenContract() {
    logger.debug("Token :: setTokenContract");
    const abi = this.getContractAbi();
    this.contract = new this.web3.eth.Contract(abi, this.contractAddress);
    logger.info("Token Contract ready");
  }

  getContractAbi() {
    logger.debug("Token :: getContractAbi");

    const rootPath = path.resolve();
    const abiFile = TOKEN_STANDARDS[this.ercStandard];
    const abiPath = path.join(rootPath, ABIS_PATH, abiFile);
    logger.info({ path: abiPath }, "Read contract file at");

    const abi = fs.readFileSync(abiPath, { encoding: "utf8" });
    return JSON.parse(abi);
  }

  // ISSUE #32 && ISSUE #58
  async setTokenDecimals() {
    logger.debug("Token :: setTokenDecimals");
    this.decimals = Number(await this.contract.methods.decimals().call());
    logger.info({ tokenDecimals: this.decimals }, "Token decimals");
  }

  // ISSUE #32 && ISSUE #58
  // DOCS can throw Errors
  async approveTransaction(owner: string, spender: string, value: string) {
    const logInput = { owner, spender, value };
    logger.debug({ logInput }, "Token :: approveTransaction");

    const allowance = await this.contract.methods
      .allowance(owner, spender)
      .call();
    logger.debug({ allowance }, "Token allowance is");

    const allowanceBN = this.web3.utils.toBN(allowance);
    const valueBN = this.web3.utils.toBN(value);
    logger.debug({ allowanceBN, valueBN }, "ERC allowance vs tx value");

    // When the spender allowance is lesser than the tx value, the tx will require approval
    // That means calling the `approve` method,
    // which creates and unsigned tx that has to be signed and submitted
    if (allowanceBN.lt(valueBN)) {
      return this.contract.methods.approve(spender, APPROVE_AMOUNT).encodeABI(); // CHECK
    }

    logger.info("Allowance bigger than tx value, approval not required");
    return null;
  }
}

export default Token;
