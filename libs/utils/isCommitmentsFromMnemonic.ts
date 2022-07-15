import ICommitments from "../../libs/models/commitment";

let allCommitmentsMatchWithCompressedZkpPK = true;

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
  listOfCommitments: ICommitments[],
  compressedZkpPublicKey: string,
): Promise<boolean> {
  for (const commitment of listOfCommitments) {
    if (commitment.preimage.compressedZkpPublicKey !== compressedZkpPublicKey) {
      allCommitmentsMatchWithCompressedZkpPK = false;
      break;
    }
  }

  if (allCommitmentsMatchWithCompressedZkpPK) {
    return true;
  }
  return false;
}

export default isCommitmentsFromMnemonic;
