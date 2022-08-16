import fs from "fs";
import mockCommitments from "../../../__mocks__/mockCommitments";
import exportFile from "../../../libs/utils/exportFile";
import readAndValidateFile from "../../../libs/utils/readAndValidateFile";
import mockInvalidCommitments from "../../../__mocks__/mockInvalidCommitments";
import { Commitment } from "libs/types";

const FILE_PATH_VALID_COMMITMENTS = "./__tests__/validCommitments.json";
const FILE_PATH_INVALID_COMMITMENTS = "./__tests__/invalidCommitments.json";

describe("Suit fo tests for import commitments function", () => {
  beforeAll(() => {
    exportFile(
      FILE_PATH_VALID_COMMITMENTS,
      JSON.stringify(
        mockCommitments.data.commitmentsByListOfCompressedZkpPublicKey,
      ),
    );
  });

  test("should import a file and the content should match with a ICommitment[] type", async () => {
    const commitments: Commitment[] | Error = await readAndValidateFile(
      FILE_PATH_VALID_COMMITMENTS,
    );
    expect(commitments).not.toBe(Error);
  });

  /**
   * Run an array of invalid commitments. Each one has one field wrote incorrectly
   */
  test.each(
    mockInvalidCommitments.data.commitmentsByListOfCompressedZkpPublicKey,
  )(
    "should import a file with invalid array of commitments and should receive an error",
    async (commitment) => {
      await exportFile(
        FILE_PATH_INVALID_COMMITMENTS,
        JSON.stringify([commitment]),
      );

      const commitments: Commitment[] | Error = await readAndValidateFile(
        FILE_PATH_INVALID_COMMITMENTS,
      );
      expect(commitments instanceof Error).toBeTruthy();

      fs.unlinkSync(FILE_PATH_INVALID_COMMITMENTS);
    },
  );

  afterAll(() => {
    fs.unlinkSync(FILE_PATH_VALID_COMMITMENTS);
  });
});
