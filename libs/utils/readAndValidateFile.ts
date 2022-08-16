import fs from "fs";
import { Commitment } from "libs/types";
import isCommitmentType from "./isCommitmentType";

/**
 *
 * @function importFile import a file and transform the cotent in a JSON format.
 * @param pathFileName an string with the path + file name.
 * @returns a list of commitments.
 * @author luizoamorim
 */
const readAndValidateFile = async (
  pathFileName: string,
): Promise<Commitment[] | Error> => {
  const file = fs.readFileSync(pathFileName);
  try {
    const commitments: Commitment[] = JSON.parse(file.toString("utf8"));
    // Verify if file in in the correct format
    for (const commitment of commitments) {
      isCommitmentType(commitment);
    }
    return commitments;
  } catch (err) {
    return err;
  }
};

export default readAndValidateFile;
