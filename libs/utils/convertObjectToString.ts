import { NightfallSdkError } from "./error";

/**
 * Converts an object into string
 *
 * @function convertObjectToString
 * @param {Object} obj
 * @throws {NightfallSdkError} param type is not object
 * @returns {string}
 */
const convertObjectToString = (obj: object) => {
  if (typeof obj !== "object") {
    throw new NightfallSdkError("Given param is not an object!");
  }
  return JSON.stringify(obj);
};

export default convertObjectToString;
