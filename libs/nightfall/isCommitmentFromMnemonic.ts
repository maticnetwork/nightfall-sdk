import path from "path";
import { Commitment } from "./types";
import { parentLogger } from "../utils";
import { NightfallSdkError } from "../utils/error";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});
/**
 * Verify if all commitments in the list belong to the user compressed zkp public key
 *
 * @async
 * @function isCommitmentsFromMnemonic
 * @param {Commitment[]} listOfCommitments a list of commitments to be verified.
 * @param {string} compressedZkpPublicKey the compressed key derivated from the mnemonic
 * @throws {NightfallSdkError} if one of the commitments doesn't match with the user compressedZkpPublicKey
 * @returns {Promise<boolean>} Should resolve `true` if all commitments match with the user compressedZkpPublicKey
 */
async function isCommitmentsFromMnemonic(
  listOfCommitments: Commitment[],
  compressedZkpPublicKey: string,
): Promise<boolean> {
  for (const commitment of listOfCommitments) {
    if (commitment.compressedZkpPublicKey !== compressedZkpPublicKey) {
      logger.error(
        "At least one of the commitments in this list does not match with the compressedZkpPublicKey!",
      );
      throw new NightfallSdkError(
        "At least one of the commitments in this list does not match with the compressedZkpPublicKey!",
      );
    }
  }

  return true;
}

export default isCommitmentsFromMnemonic;
