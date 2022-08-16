import { Commitment } from "libs/types";

/**
 * @function isCommitmentsFromMnemonic should verify if all commitments in the list
 * belongs to the compressed zkp public key.
 * @param listOfCommitments a list of commitments to be verified.
 * @param compressedZkpPublicKey the compressed key derivated from the mnemonic that shall be
 * in the environment variables.
 * @returns true if all commitments match or false if don't match.
 * @author luizoamorim
 */
async function isCommitmentsFromMnemonic(
  listOfCommitments: Commitment[],
  compressedZkpPublicKey: string,
): Promise<boolean> {
  for (const commitment of listOfCommitments) {
    if (commitment.compressedZkpPublicKey !== compressedZkpPublicKey) {
      return false;
    }
  }

  return true;
}

export default isCommitmentsFromMnemonic;
