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
 * @function commitmentsFromMnemonic
 * @param {Commitment[]} listOfCommitments a list of commitments to be verified.
 * @param {string} compressedZkpPublicKey the compressed key derived from the mnemonic
 * @throws {NightfallSdkError} if one of the commitments doesn't match with the user compressedZkpPublicKey
 */
function commitmentsFromMnemonic(
  listOfCommitments: Commitment[],
  compressedZkpPublicKey: string,
) {
  logger.debug("commitmentsFromMnemonic");

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
}

export default commitmentsFromMnemonic;
