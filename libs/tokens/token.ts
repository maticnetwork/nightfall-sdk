import path from "path";
import type Web3 from "web3";
import type { Contract } from "web3-eth-contract";
import { parentLogger } from "../utils";
import { APPROVE_AMOUNT } from "./constants";
import type { TokenOptions } from "./types";
import erc20Abi from "./abis/ERC20.json";
import type { AbiItem } from "web3-utils";
import { NightfallSdkError } from "../utils/error";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

class TokenFactory {
  static async create(options: TokenOptions) {
    logger.debug("TokenFactory :: create");

    const token = new Token(options);

    try {
      await token.setTokenDecimals();
    } catch (err) {
      logger.child(options).error(err, "Unable to set token decimals");
      throw new NightfallSdkError(err);
    }

    return token;
  }
}

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
    this.contractAddress = options.contractAddress;
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
    return erc20Abi as unknown as AbiItem;
  }

  // ISSUE #32 && ISSUE #54
  async setTokenDecimals() {
    logger.debug("Token :: setTokenDecimals");
    this.decimals = Number(await this.contract.methods.decimals().call());
    logger.info({ tokenDecimals: this.decimals }, "Token decimals");
  }

  // ISSUE #32 && ISSUE #54
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
      return this.contract.methods.approve(spender, APPROVE_AMOUNT).encodeABI();
    }

    logger.info("Allowance bigger than tx value, approval not required");
    return null;
  }
}

export default TokenFactory;
