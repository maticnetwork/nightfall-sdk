"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringValueToWei = void 0;
const web3_utils_1 = require("web3-utils");
/**
 * Validates that given value is string
 *
 * @function isString
 * @param {unknown} value transaction value
 * @returns {boolean}
 */
function isString(s) {
    return typeof s === "string" || s instanceof String;
}
/**
 * Validates that given value string does not start with `-` ie negative
 *
 * @function isPositive
 * @param {string} value transaction value
 * @returns {boolean}
 */
function isPositive(value) {
    return value.substring(0, 1) !== "-";
}
/**
 * Validates against empty string and `.`
 *
 * @function isValidString
 * @param {string} value transaction value
 * @returns {boolean}
 */
function isValidString(value) {
    return value.length > 0 && value !== ".";
}
/**
 * Validates that splitting value returns 2 items max (ie whole and fraction)
 *
 * @function isDecimalPartValid
 * @param {string} value transaction value
 * @returns {boolean}
 */
function isDecimalPartValid(value) {
    const parts = value.split(".");
    return parts.length <= 2;
}
/**
 * Convert transaction value to wei based on token decimals
 *
 * @function stringValueToWei
 * @param {string} value transaction value
 * @param {number} tokenDecimals specified in token contract when calling decimals
 * @throws {Error} Performs a number of validations that can throw different errors
 * @returns {string} value in wei
 */
function stringValueToWei(value, tokenDecimals) {
    if (!isString(value)) {
        throw new Error("Pass strings to prevent floating point precision issues");
    }
    if (!isValidString(value)) {
        throw new Error("Empty string or `.` are not valid");
    }
    if (!isPositive(value)) {
        throw new Error("Value can not be negative");
    }
    if (!isDecimalPartValid(value)) {
        throw new Error("Too many decimal points");
    }
    if (tokenDecimals === 0) {
        return value;
    }
    // Manage value whole and fraction parts
    const parts = value.split(".");
    let whole;
    whole = parts[0];
    if (!whole)
        whole = "0";
    let fraction;
    fraction = parts.length > 1 ? parts[1] : "0";
    if (fraction.length > tokenDecimals) {
        throw new Error("Too many decimal places");
    }
    // Begin conversion
    while (fraction.length < tokenDecimals) {
        fraction += "0";
    }
    whole = (0, web3_utils_1.toBN)(whole);
    fraction = (0, web3_utils_1.toBN)(fraction);
    const ten = (0, web3_utils_1.toBN)(10);
    const base = ten.pow((0, web3_utils_1.toBN)(tokenDecimals));
    const wei = whole.mul(base).add(fraction);
    return wei.toString(10);
}
exports.stringValueToWei = stringValueToWei;
//# sourceMappingURL=stringValueToWei.js.map