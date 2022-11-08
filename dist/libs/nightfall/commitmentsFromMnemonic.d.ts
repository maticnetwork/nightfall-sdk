import { Commitment } from "./types";
/**
 * Verify if all commitments in the list belong to the user compressed zkp public key
 *
 * @async
 * @function commitmentsFromMnemonic
 * @param {Commitment[]} listOfCommitments a list of commitments to be verified.
 * @param {string} compressedZkpPublicKey the compressed key derived from the mnemonic
 * @throws {NightfallSdkError} if one of the commitments doesn't match with the user compressedZkpPublicKey
 * @returns {boolean} `true` when all commitments belong to given compressedZkpPublicKey
 */
declare function commitmentsFromMnemonic(listOfCommitments: Commitment[], compressedZkpPublicKey: string): boolean;
export default commitmentsFromMnemonic;
