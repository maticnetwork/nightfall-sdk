/**
 * Convert transaction value to wei based on token decimals
 *
 * @function stringValueToWei
 * @param {string} value transaction value
 * @param {number} tokenDecimals specified in token contract when calling decimals
 * @throws {Error} Performs a number of validations that can throw different errors
 * @returns {string} value in wei
 */
export declare function stringValueToWei(value: string, tokenDecimals: number): string;
