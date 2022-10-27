"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInputValid = exports.checkBalancesOptions = exports.finaliseWithdrawalOptions = exports.makeWithdrawalOptions = exports.makeTransferOptions = exports.makeDepositOptions = exports.createOptions = void 0;
const joi_1 = __importDefault(require("joi"));
const error_1 = require("../utils/error");
const web3_utils_1 = require("web3-utils");
const constants_1 = require("./constants");
const isChecksum = (ethAddress, helpers) => {
    const isValid = (0, web3_utils_1.checkAddressChecksum)(ethAddress);
    if (!isValid)
        return helpers.message({ custom: "Invalid checksum, review ethAddress" });
    return ethAddress;
};
// See https://joi.dev/tester/
const PATTERN_ETH_PRIVATE_KEY = /^0x[0-9a-f]{64}$/;
exports.createOptions = joi_1.default.object({
    clientApiUrl: joi_1.default.string().trim().required(),
    blockchainWsUrl: joi_1.default.string().trim(),
    ethereumPrivateKey: joi_1.default.string().trim().pattern(PATTERN_ETH_PRIVATE_KEY),
    nightfallMnemonic: joi_1.default.string().trim(),
}).with("ethereumPrivateKey", "blockchainWsUrl");
const makeTransaction = joi_1.default.object({
    tokenContractAddress: joi_1.default.string()
        .trim()
        .custom(isChecksum, "custom validation")
        .required(),
    tokenErcStandard: joi_1.default.string(),
    value: joi_1.default.string(),
    tokenId: joi_1.default.string(),
    feeWei: joi_1.default.string().default(constants_1.TX_FEE_ETH_WEI_DEFAULT),
}).or("value", "tokenId"); // these cannot have default
exports.makeDepositOptions = makeTransaction;
exports.makeTransferOptions = makeTransaction.append({
    feeWei: joi_1.default.string().default(constants_1.TX_FEE_MATIC_WEI_DEFAULT),
    recipientNightfallAddress: joi_1.default.string().trim().required(),
    isOffChain: joi_1.default.boolean().default(false),
});
exports.makeWithdrawalOptions = makeTransaction.append({
    feeWei: joi_1.default.string().default(constants_1.TX_FEE_MATIC_WEI_DEFAULT),
    recipientEthAddress: joi_1.default.string().trim().required(),
    isOffChain: joi_1.default.boolean().default(false),
});
exports.finaliseWithdrawalOptions = joi_1.default.object({
    withdrawTxHashL2: joi_1.default.string().trim(),
});
exports.checkBalancesOptions = joi_1.default.object({
    tokenContractAddresses: joi_1.default.array().items(joi_1.default.string().trim().custom(isChecksum, "custom validation")),
});
function isInputValid(error) {
    if (error !== undefined) {
        const message = error.details.map((e) => e.message).join();
        // TODO log error ISSUE #33
        throw new error_1.NightfallSdkError(message);
    }
}
exports.isInputValid = isInputValid;
//# sourceMappingURL=validations.js.map