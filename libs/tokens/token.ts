import path from "path";
import type Web3 from "web3";
import type { Contract } from "web3-eth-contract";
import { parentLogger } from "../utils";
import { APPROVE_AMOUNT } from "./constants";
import type { TokenOptions } from "./types";
import erc20Abi from "./abis/ERC20.json";
import erc721Abi from "./abis/ERC721.json";
import type { AbiItem } from "web3-utils";
import { NightfallSdkError } from "../utils/error";
import { ERC20, ERC721, ERC1155 } from "./constants";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

class TokenFactory {
  static async create(options: TokenOptions) {
    logger.debug("TokenFactory :: create");

    const token = new Token(options);

    try {
      if (token.ercStandard == ERC20) {
        await token.setTokenDecimals();
      } else {
        token.decimals = 0;
      }
    } catch (err) {
      logger.child(options).error(err, "Unable to set token decimals");
      throw new NightfallSdkError(err);
    }

    logger.info(
      {
        address: token.contractAddress,
        ercStandard: token.ercStandard,
        decimals: token.decimals,
      },
      "Token is",
    );
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

    this.setTokenContract();
  }

  setTokenContract() {
    logger.debug("Token :: setTokenContract");
    const abi = this.getContractAbi();
    this.contract = new this.web3.eth.Contract(abi, this.contractAddress);
    logger.debug("Token Contract ready");
  }

  getContractAbi() {
    logger.debug("Token :: getContractAbi");
    if (this.ercStandard == ERC721) {
      return erc721Abi as unknown as AbiItem;
    } else {
      return erc20Abi as unknown as AbiItem;
    }
  }

  async setTokenDecimals() {
    logger.debug("Token :: setTokenDecimals");
    this.decimals = Number(await this.contract.methods.decimals().call());
    logger.debug({ tokenDecimals: this.decimals }, "Token decimals");
  }

  async isTransactionApproved(
    owner: string,
    spender: string,
    value: string,
  ): Promise<boolean> {
    const logInput = { owner, spender, value };
    logger.debug({ logInput }, "Token :: isTransactionApproved");

    if (this.ercStandard == ERC721 || this.ercStandard == ERC1155) {
      logger.debug("Check if it's approved for all...");
      return this.contract.methods.isApprovedForAll(owner, spender).call();
    }

    // ERC20
    logger.debug("Check allowance...");
    const allowance = await this.contract.methods
      .allowance(owner, spender)
      .call();

    const allowanceBN = this.web3.utils.toBN(allowance);
    const valueBN = this.web3.utils.toBN(value);
    logger.debug({ allowanceBN, valueBN }, "ERC allowanceBN vs tx valueBN");

    // When the spender allowance is bigger than the tx value, the tx does NOT require approval
    return allowanceBN.gt(valueBN);
  }

  async approvalUnsignedTransaction(spender: string) {
    logger.debug({ spender }, "Token :: approvalUnsignedTransaction");

    if (this.ercStandard == ERC721 || this.ercStandard == ERC1155) {
      logger.debug("Create approval for all tx...");
      return this.contract.methods.setApprovalForAll(spender, true).encodeABI();
    }

    logger.debug("Create approve tx...");
    return this.contract.methods.approve(spender, APPROVE_AMOUNT).encodeABI();
  }

  async approve(owner: string, spender: string) {
    logger.debug({ owner, spender }, "Token :: approve");

    if (this.ercStandard == ERC721 || this.ercStandard == ERC1155) {
      logger.debug("Set approval for all via MetaMask...");
      return this.contract.methods
        .setApprovalForAll(spender, true)
        .send({ from: owner });
    }

    logger.debug("Approve via MetaMask...");
    return this.contract.methods
      .approve(spender, APPROVE_AMOUNT)
      .send({ from: owner });
  }
}

export default TokenFactory;
