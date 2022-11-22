import type Web3 from "web3";
import type { Contract } from "web3-eth-contract";
import { logger, NightfallSdkError } from "../utils";
import { APPROVE_AMOUNT } from "./constants";
import type { TokenOptions } from "./types";
import erc20Abi from "./abis/ERC20.json";
import erc165Abi from "../../libs/tokens/abis/ERC165.json";
import erc721Abi from "./abis/ERC721.json";
import erc1155Abi from "./abis/ERC1155.json";
import type { AbiItem } from "web3-utils";
import { ERC20, ERC721, ERC1155, ERC721_INTERFACE_ID } from "./constants";
/**
 * Detects ERC standard for a given contract address using ERC165
 *
 * @function whichTokenStandard
 * @param {string} contractAddress
 * @param {Web3} web3
 * @returns {string} "ERC20" | "ERC721" | "ERC1155"
 */
export async function whichTokenStandard(
  contractAddress: string,
  web3: Web3,
): Promise<string> {
  logger.debug({ contractAddress }, "whichTokenStandard");

  const abi = erc165Abi as unknown as AbiItem;
  const erc165 = new web3.eth.Contract(abi, contractAddress);

  try {
    const interface721 = await erc165.methods
      .supportsInterface(ERC721_INTERFACE_ID)
      .call();
    if (interface721) {
      logger.debug("ERC721 interface detected");
      return ERC721;
    }
    logger.debug("ERC1155 interface detected");
    return ERC1155;
  } catch {
    logger.debug("ERC165 reverted tx, assume interface ERC20");
    return ERC20;
  }
}

export class TokenFactory {
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

  getContractAbi() {
    logger.debug("Token :: getContractAbi");
    if (this.ercStandard == ERC721) {
      return erc721Abi as unknown as AbiItem;
    } else if (this.ercStandard == ERC1155) {
      return erc1155Abi as unknown as AbiItem;
    } else {
      return erc20Abi as unknown as AbiItem;
    }
  }

  setTokenContract() {
    logger.debug("Token :: setTokenContract");
    const abi = this.getContractAbi();
    this.contract = new this.web3.eth.Contract(abi, this.contractAddress);
    logger.debug("Token Contract ready");
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
