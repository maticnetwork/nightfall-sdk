import fs from "fs";
import { Commitment } from "libs/types";

/**
 *
 * @function importFile import a file and transform the cotent in a JSON format.
 * @param pathFileName an string with the path + file name.
 * @returns a list of commitments.
 */
const readAndValidateFile = async (
  pathFileName: string,
): Promise<Commitment[]> => {
  const file = fs.readFileSync(pathFileName);

  const commitments: Commitment[] = JSON.parse(file.toString("utf8"));
  // Verify if file in in the correct format
  // for (const commitment of commitments) {
  //   isCommitmentType(commitment);
  // }
  return commitments;
};

export default readAndValidateFile;
