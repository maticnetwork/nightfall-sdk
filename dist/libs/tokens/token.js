"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenFactory = exports.whichTokenStandard = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
const constants_1 = require("./constants");
const ERC20_json_1 = __importDefault(require("./abis/ERC20.json"));
const ERC165_json_1 = __importDefault(require("../../libs/tokens/abis/ERC165.json"));
const ERC721_json_1 = __importDefault(require("./abis/ERC721.json"));
const ERC1155_json_1 = __importDefault(require("./abis/ERC1155.json"));
const error_1 = require("../utils/error");
const constants_2 = require("./constants");
const logger = utils_1.parentLogger.child({
    name: path_1.default.relative(process.cwd(), __filename),
});
/**
 * Detects ERC standard for a given contract address using ERC165
 *
 * @function whichTokenStandard
 * @param {string} contractAddress
 * @param {Web3} web3
 * @returns {string} "ERC20" | "ERC721" | "ERC1155"
 */
async function whichTokenStandard(contractAddress, web3) {
    logger.debug({ contractAddress }, "whichTokenStandard");
    const abi = ERC165_json_1.default;
    const erc165 = new web3.eth.Contract(abi, contractAddress);
    try {
        const interface721 = await erc165.methods
            .supportsInterface(constants_2.ERC721_INTERFACE_ID)
            .call();
        if (interface721) {
            logger.debug("ERC721 interface detected");
            return constants_2.ERC721;
        }
        logger.debug("ERC1155 interface detected");
        return constants_2.ERC1155;
    }
    catch (_a) {
        logger.debug("ERC165 reverted tx, assume interface ERC20");
        return constants_2.ERC20;
    }
}
exports.whichTokenStandard = whichTokenStandard;
class TokenFactory {
    static async create(options) {
        logger.debug("TokenFactory :: create");
        const token = new Token(options);
        try {
            if (token.ercStandard == constants_2.ERC20) {
                await token.setTokenDecimals();
            }
            else {
                token.decimals = 0;
            }
        }
        catch (err) {
            logger.child(options).error(err, "Unable to set token decimals");
            throw new error_1.NightfallSdkError(err);
        }
        logger.info({
            address: token.contractAddress,
            ercStandard: token.ercStandard,
            decimals: token.decimals,
        }, "Token is");
        return token;
    }
}
exports.TokenFactory = TokenFactory;
class Token {
    constructor(options) {
        logger.debug("new Token");
        this.web3 = options.web3;
        this.contractAddress = options.contractAddress;
        this.ercStandard = options.ercStandard.toUpperCase();
        this.setTokenContract();
    }
    getContractAbi() {
        logger.debug("Token :: getContractAbi");
        if (this.ercStandard == constants_2.ERC721) {
            return ERC721_json_1.default;
        }
        else if (this.ercStandard == constants_2.ERC1155) {
            return ERC1155_json_1.default;
        }
        else {
            return ERC20_json_1.default;
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
    async isTransactionApproved(owner, spender, value) {
        const logInput = { owner, spender, value };
        logger.debug({ logInput }, "Token :: isTransactionApproved");
        if (this.ercStandard == constants_2.ERC721 || this.ercStandard == constants_2.ERC1155) {
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
    async approvalUnsignedTransaction(spender) {
        logger.debug({ spender }, "Token :: approvalUnsignedTransaction");
        if (this.ercStandard == constants_2.ERC721 || this.ercStandard == constants_2.ERC1155) {
            logger.debug("Create approval for all tx...");
            return this.contract.methods.setApprovalForAll(spender, true).encodeABI();
        }
        logger.debug("Create approve tx...");
        return this.contract.methods.approve(spender, constants_1.APPROVE_AMOUNT).encodeABI();
    }
    async approve(owner, spender) {
        logger.debug({ owner, spender }, "Token :: approve");
        if (this.ercStandard == constants_2.ERC721 || this.ercStandard == constants_2.ERC1155) {
            logger.debug("Set approval for all via MetaMask...");
            return this.contract.methods
                .setApprovalForAll(spender, true)
                .send({ from: owner });
        }
        logger.debug("Approve via MetaMask...");
        return this.contract.methods
            .approve(spender, constants_1.APPROVE_AMOUNT)
            .send({ from: owner });
    }
}
//# sourceMappingURL=token.js.map