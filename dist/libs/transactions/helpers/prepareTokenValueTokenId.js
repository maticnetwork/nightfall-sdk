"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareTokenValueTokenId = void 0;
const path_1 = __importDefault(require("path"));
const tokens_1 = require("../../tokens");
const constants_1 = require("../../tokens/constants");
const constants_2 = require("../../user/constants");
const stringValueToWei_1 = require("./stringValueToWei");
const utils_1 = require("../../utils");
const logger = utils_1.parentLogger.child({
    name: path_1.default.relative(process.cwd(), __filename),
});
/**
 * Determine ERC standard
 * Set value/tokenId defaults
 * Create an instance of Token
 * Convert value to Wei if needed
 *
 * @function whichTokenStandard
 * @param {string} contractAddress
 * @param {Web3} web3
 * @returns {string} "ERC20" | "ERC721" | "ERC1155"
 */
async function prepareTokenValueTokenId(contractAddress, value, tokenId, web3) {
    logger.debug("prepareTokenValueTokenId");
    // Determine ERC standard
    const ercStandard = await (0, tokens_1.whichTokenStandard)(contractAddress, web3);
    // Set value/tokenId defaults based on token ERC standard
    if (ercStandard === constants_1.ERC20)
        tokenId = constants_2.TX_TOKEN_ID_DEFAULT;
    if (ercStandard === constants_1.ERC721)
        value = constants_2.TX_VALUE_DEFAULT;
    // Create an instance of Token
    const token = await tokens_1.TokenFactory.create({
        contractAddress,
        ercStandard,
        web3,
    });
    // Convert value to Wei if needed
    let valueWei = "0";
    if (value !== "0") {
        valueWei = (0, stringValueToWei_1.stringValueToWei)(value, token.decimals);
    }
    logger.debug({ valueWei, tokenId }, "Final value[Wei], tokenId");
    return { token, valueWei, tokenId };
}
exports.prepareTokenValueTokenId = prepareTokenValueTokenId;
//# sourceMappingURL=prepareTokenValueTokenId.js.map