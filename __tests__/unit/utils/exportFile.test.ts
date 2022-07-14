import fs from "fs";
import mockCommitments from "../../../__mocks__/mockCommitments";
import exportFile from "../../../libs/utils/exportFile";

describe("Suit fo tests for export file function", () => {
  test("should export a file for the path informated", async () => {
    const FILE_PATH = "./__tests__/file.json";

    exportFile(
      FILE_PATH,
      JSON.stringify(
        mockCommitments.data.allCommitmentsByListOfCompressedZkpPublicKey,
      ),
    );
    const data = fs.readFileSync(FILE_PATH);
    expect(data.toString("utf8")).toBe(
      JSON.stringify(
        mockCommitments.data.allCommitmentsByListOfCompressedZkpPublicKey,
      ),
    );

    // remove the file created
    fs.unlinkSync(FILE_PATH);
  });
});
