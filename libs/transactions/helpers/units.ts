import { toBN } from "web3-utils";
import type BN from "bn.js";

/**
 * Validates that given value is string
 *
 * @function isString
 * @param {unknown} value transaction value
 * @returns {boolean}
 */
function isString(s: unknown): boolean {
  return typeof s === "string" || s instanceof String;
}

/**
 * Validates that given value string does not start with `-` ie negative
 *
 * @function isPositive
 * @param {string} value transaction value
 * @returns {boolean}
 */
function isPositive(value: string): boolean {
  return value.substring(0, 1) !== "-";
}

/**
 * Validates against empty string and `.`
 *
 * @function isValidString
 * @param {string} value transaction value
 * @returns {boolean}
 */
function isValidString(value: string): boolean {
  return value.length > 0 && value !== ".";
}

/**
 * Validates that splitting value returns 2 items max (ie whole and fraction)
 *
 * @function isDecimalPartValid
 * @param {string} value transaction value
 * @returns {boolean}
 */
function isDecimalPartValid(value: string): boolean {
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
export function stringValueToWei(value: string, tokenDecimals: number): string {
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

  let whole: string | BN;
  whole = parts[0];
  if (!whole) whole = "0";

  let fraction: string | BN;
  fraction = parts.length > 1 ? parts[1] : "0";

  if (fraction.length > tokenDecimals) {
    throw new Error("Too many decimal places");
  }

  // Begin conversion
  while (fraction.length < tokenDecimals) {
    fraction += "0";
  }

  whole = toBN(whole);
  fraction = toBN(fraction);
  const ten = toBN(10);
  const base = ten.pow(toBN(tokenDecimals));
  const wei = whole.mul(base).add(fraction);

  return wei.toString(10);
}
