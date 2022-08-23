import { Commitment } from "../types";

const ERROR_INVALID_COMMITMENT_TYPE =
  "Your file do not correspond a ICommitment[] type.";
/**
 *
 * @function isCommitmentType should verify if the object received is of a Commitment type.
 * @param commitment a object that should be a commitment type
 * @returns an error if the object don't have some of the type attributes.
 */
function isCommitmentType(commitment: Commitment) {
  if (commitment._id === undefined)
    throw new Error(ERROR_INVALID_COMMITMENT_TYPE);
  if (commitment.compressedZkpPublicKey === undefined)
    throw new Error(ERROR_INVALID_COMMITMENT_TYPE);
  if (commitment.blockNumber === undefined)
    throw new Error(ERROR_INVALID_COMMITMENT_TYPE);
  if (commitment.isDeposited === undefined)
    throw new Error(ERROR_INVALID_COMMITMENT_TYPE);
  if (commitment.isNullified === undefined)
    throw new Error(ERROR_INVALID_COMMITMENT_TYPE);
  if (commitment.isNullifiedOnChain === undefined)
    throw new Error(ERROR_INVALID_COMMITMENT_TYPE);
  if (commitment.isOnChain === undefined)
    throw new Error(ERROR_INVALID_COMMITMENT_TYPE);
  if (commitment.isPendingNullification === undefined)
    throw new Error(ERROR_INVALID_COMMITMENT_TYPE);
  if (commitment.nullifier === undefined)
    throw new Error(ERROR_INVALID_COMMITMENT_TYPE);
  if (commitment.preimage === undefined)
    throw new Error(ERROR_INVALID_COMMITMENT_TYPE);
  if (commitment.preimage.ercAddress === undefined)
    throw new Error(ERROR_INVALID_COMMITMENT_TYPE);
  if (commitment.preimage.salt === undefined)
    throw new Error(ERROR_INVALID_COMMITMENT_TYPE);
  if (commitment.preimage.tokenId === undefined)
    throw new Error(ERROR_INVALID_COMMITMENT_TYPE);
  if (commitment.preimage.value === undefined)
    throw new Error(ERROR_INVALID_COMMITMENT_TYPE);
  if (commitment.preimage.zkpPublicKey === undefined)
    throw new Error(ERROR_INVALID_COMMITMENT_TYPE);
}

export default isCommitmentType;
