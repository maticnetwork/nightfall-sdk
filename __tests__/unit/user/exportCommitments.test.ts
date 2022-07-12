import fs from "fs";
import mockCommitments from "../../../__mocks__/mockCommitments";
import { User } from "../../../libs/user";
const DUMMY_COMPRESSED_PKD = "dummyCompressedPkd";
jest.mock("../../../libs/client/client");
import getAllCommitmentsByCompressedPkdStub from "../../../__mocks__/__stubs__/client";

describe("Suit of tests for user class", () => {
  beforeAll(() => {
    getAllCommitmentsByCompressedPkdStub;
  });
  test("Verify if the file is created with the commitments by this compressedPkd", async () => {
    const user = new User();
    await user.exportCommitments(
      DUMMY_COMPRESSED_PKD,
      "./",
      "commitmentsBackup.json",
    );
    const FILE_PATH = "./commitmentsBackup.json";
    const data = fs.readFileSync(FILE_PATH);
    expect(data.toString("utf8")).toBe(
      JSON.stringify(mockCommitments.data.allCommitmentsByCompressedPkd),
    );

    // removing the file
    fs.unlinkSync(FILE_PATH);
  });
});
