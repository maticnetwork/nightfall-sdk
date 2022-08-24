import path from "path";
import { Commitment } from "libs/types";
import { parentLogger } from "../utils";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});
/**
 *
 * @async
 * @function isCommitmentsFromMnemonic should verify if all commitments in the list
 * belongs to the compressed zkp public key.
 * @param listOfCommitments a list of commitments to be verified.
 * @param compressedZkpPublicKey the compressed key derivated from the mnemonic that shall be
 * in the environment variables.
 * @throws a new Error if one of the commitments doesn't match with the user compressedZkpPublicKey
 * @returns true if all commitments match with the user compressedZkpPublicKey.
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
      throw new Error(
        "At least one of the commitments in this list does not match with the compressedZkpPublicKey!",
      );
    }
  }

  return true;
}

export default isCommitmentsFromMnemonic;
