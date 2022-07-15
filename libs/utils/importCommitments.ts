import fs from "fs";
import ICommitments from "../../libs/models/commitment";
import isCommitmentType from "./isCommitmentType";

/**
 *
 * @function importFile import a file and transform the cotent in a JSON format.
 * @param pathFileName an string with the path + file name.
 * @returns a list of commitments.
 * @author luizoamorim
 */
const importCommitments = async (
  pathFileName: string,
): Promise<ICommitments[] | Error> => {
  const file = fs.readFileSync(pathFileName);
  try {
    const commitments: ICommitments[] = JSON.parse(file.toString("utf8"));
    // Verify if file in in the correct format
    for (const commitment of commitments) {
      isCommitmentType(commitment);
    }
    return commitments;
  } catch (err) {
    return err;
  }
};

export default importCommitments;
