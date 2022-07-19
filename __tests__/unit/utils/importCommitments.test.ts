import fs from "fs";
import mockCommitments from "../../../__mocks__/mockCommitments";
import exportFile from "../../../libs/utils/exportFile";
import importCommitments from "../../../libs/utils/importCommitments";
import ICommitments from "../../../libs/models/commitment";
import mockInvalidCommitments from "../../../__mocks__/mockInvalidCommitments";

const FILE_PATH_VALID_COMMITMETS = "./__tests__/validCommitments.json";
const FILE_PATH_INVALID_COMMITMETS = "./__tests__/invalidCommitments.json";
let index = 0;
describe("Suit fo tests for import commitments function", () => {
  beforeAll(() => {
    exportFile(
      FILE_PATH_VALID_COMMITMETS,
      JSON.stringify(
        mockCommitments.data.commitmentsByListOfCompressedZkpPublicKey,
      ),
    );
  });
  beforeEach(() => {
    exportFile(
      FILE_PATH_INVALID_COMMITMETS,
      JSON.stringify([
        mockInvalidCommitments.data.commitmentsByListOfCompressedZkpPublicKey[
          index
        ],
      ]),
    );
    index++;
  });

  test("should import a file and the content should match with a ICommitment[] type", async () => {
    const commitments: ICommitments[] | Error = await importCommitments(
      FILE_PATH_VALID_COMMITMETS,
    );
    index = 0;
    expect(commitments).not.toBe(Error);
  });

  test("should import a file with invalid (wrong id field) array of commitments and should receive an error", async () => {
    const commitments: ICommitments[] | Error = await importCommitments(
      FILE_PATH_INVALID_COMMITMETS,
    );
    expect(commitments instanceof Error).toBeTruthy();
  });

  test("should import a file with invalid (wrong preimage field) array of commitments and should receive an error", async () => {
    const commitments: ICommitments[] | Error = await importCommitments(
      FILE_PATH_INVALID_COMMITMETS,
    );
    expect(commitments instanceof Error).toBeTruthy();
  });

  test("should import a file with invalid (wrong preimage.ercAddress field) array of commitments and should receive an error", async () => {
    const commitments: ICommitments[] | Error = await importCommitments(
      FILE_PATH_INVALID_COMMITMETS,
    );
    expect(commitments instanceof Error).toBeTruthy();
  });

  test("should import a file with invalid (wrong preimage.tokenId field) array of commitments and should receive an error", async () => {
    const commitments: ICommitments[] | Error = await importCommitments(
      FILE_PATH_INVALID_COMMITMETS,
    );
    expect(commitments instanceof Error).toBeTruthy();
  });

  test("should import a file with invalid (wrong preimage.value field) array of commitments and should receive an error", async () => {
    const commitments: ICommitments[] | Error = await importCommitments(
      FILE_PATH_INVALID_COMMITMETS,
    );
    expect(commitments instanceof Error).toBeTruthy();
  });

  test("should import a file with invalid (wrong preimage.zkpPublicKey field) array of commitments and should receive an error", async () => {
    const commitments: ICommitments[] | Error = await importCommitments(
      FILE_PATH_INVALID_COMMITMETS,
    );
    expect(commitments instanceof Error).toBeTruthy();
  });

  test("should import a file with invalid (wrong preimage.compressedZkpPublicKey field) array of commitments and should receive an error", async () => {
    const commitments: ICommitments[] | Error = await importCommitments(
      FILE_PATH_INVALID_COMMITMETS,
    );
    expect(commitments instanceof Error).toBeTruthy();
  });

  test("should import a file with invalid (wrong preimage.salt field) array of commitments and should receive an error", async () => {
    const commitments: ICommitments[] | Error = await importCommitments(
      FILE_PATH_INVALID_COMMITMETS,
    );
    expect(commitments instanceof Error).toBeTruthy();
  });

  test("should import a file with invalid (wrong isDeposited field) array of commitments and should receive an error", async () => {
    const commitments: ICommitments[] | Error = await importCommitments(
      FILE_PATH_INVALID_COMMITMETS,
    );
    expect(commitments instanceof Error).toBeTruthy();
  });

  test("should import a file with invalid (wrong isOnChain field) array of commitments and should receive an error", async () => {
    const commitments: ICommitments[] | Error = await importCommitments(
      FILE_PATH_INVALID_COMMITMETS,
    );
    expect(commitments instanceof Error).toBeTruthy();
  });

  test("should import a file with invalid (wrong isPendingNullification field) array of commitments and should receive an error", async () => {
    const commitments: ICommitments[] | Error = await importCommitments(
      FILE_PATH_INVALID_COMMITMETS,
    );
    expect(commitments instanceof Error).toBeTruthy();
  });

  test("should import a file with invalid (wrong isNullified field) array of commitments and should receive an error", async () => {
    const commitments: ICommitments[] | Error = await importCommitments(
      FILE_PATH_INVALID_COMMITMETS,
    );
    expect(commitments instanceof Error).toBeTruthy();
  });

  test("should import a file with invalid (wrong isNullifiedOnChain field) array of commitments and should receive an error", async () => {
    const commitments: ICommitments[] | Error = await importCommitments(
      FILE_PATH_INVALID_COMMITMETS,
    );
    expect(commitments instanceof Error).toBeTruthy();
  });

  test("should import a file with invalid (wrong nullifier field) array of commitments and should receive an error", async () => {
    const commitments: ICommitments[] | Error = await importCommitments(
      FILE_PATH_INVALID_COMMITMETS,
    );
    expect(commitments instanceof Error).toBeTruthy();
  });

  test("should import a file with invalid (wrong wrongblockNumber field) array of commitments and should receive an error", async () => {
    const commitments: ICommitments[] | Error = await importCommitments(
      FILE_PATH_INVALID_COMMITMETS,
    );
    expect(commitments instanceof Error).toBeTruthy();
  });

  afterEach(() => {
    fs.unlinkSync(FILE_PATH_INVALID_COMMITMETS);
  });

  afterAll(() => {
    fs.unlinkSync(FILE_PATH_VALID_COMMITMETS);
  });
});
