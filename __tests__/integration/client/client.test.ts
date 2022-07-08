import axios from "axios";
jest.mock("axios");
import fs from "fs";
import convertObjectToString from "../../../libs/utils/convertObjectToString";
import exportFile from "../../../libs/utils/exportFile";
import { Client } from "../../../libs/client/index";
import mockCommitments from "../../../__mocks__/commitments";

describe("Suit of integration tests user functionalities", () => {
  const mockedAxios = axios as unknown as jest.Mocked<typeof axios>;
  const environment = {
    apiUrl: process.env.SDK_ENV_API_URL,
  };

  test("Should test the integration of the unit functions for export commitments flow", async () => {
    mockedAxios.get.mockResolvedValue(mockCommitments);

    const client = new Client(environment.apiUrl);
    const commitments = await client.getAllCommitmentsByCompressedPkd(
      "compressedPkd",
    );

    const FILE_PATH = "./__tests__/file.json";
    exportFile(FILE_PATH, convertObjectToString(commitments));
    const data = fs.readFileSync(FILE_PATH);

    expect(data.toString("utf8")).toBe(JSON.stringify(commitments));
    // removing the file
    fs.unlinkSync(FILE_PATH);

    console.log("Integration test for export commitments file checked");
  });
});
