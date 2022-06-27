import axios from "axios";
import * as APIService from "../../../libs/commitments/getCommitments";
import { commitments } from "../../../__mocks__/useCases/ExportCommitments/commitments";
jest.mock("axios");
import fs from "fs";
import { concatTwoArrays } from "../../../libs/utils/concatTwoArrays";
import convertObjectToString from "../../../libs/utils/convertObjectToString";
import exportFile from "../../../libs/utils/exportFile";
import { Client } from "../../../libs/client/index";

describe("Suit of tests for get commitmens from some endpoint", () => {
  const mockedAxios = axios as unknown as jest.Mocked<typeof axios>;
  const environment = {
    apiUrl: process.env.SDK_ENV_API_URL,
  };

  test("Should get a json from getCommitmentsOnChain endpoint", async () => {
    // arrange
    mockedAxios.get.mockResolvedValue(commitments);

    const commitmentsOnChain = await APIService.getCommitmentsOnChain();
    const commitmentsOffChain = await APIService.getCommitmentsOffChain();

    console.log("COMMITMENTS: ", commitmentsOnChain);

    const concatedArrays = concatTwoArrays(
      commitmentsOnChain.data,
      commitmentsOffChain.data,
    );

    const FILE_PATH = "./__test__/file.json";
    exportFile(FILE_PATH, convertObjectToString(concatedArrays));
    const data = fs.readFileSync(FILE_PATH);

    expect(data.toString("utf8")).toBe(JSON.stringify(concatedArrays));
    // removing the file
    fs.unlinkSync(FILE_PATH);

    // const FILE_PATH_FOR_USE_CASE_FOLDER = "./file.json";
    // const client = new Client(environment.apiUrl);
    // client.getCommitmentsAndExportFile(FILE_PATH_FOR_USE_CASE_FOLDER);
    // const realData = fs.readFileSync(FILE_PATH_FOR_USE_CASE_FOLDER);
    // expect(realData.toString("utf8")).toBe(JSON.stringify(concatedArrays));
    // fs.unlinkSync(FILE_PATH_FOR_USE_CASE_FOLDER);
    console.log("E2E test for export commitments file checked");
  });
});
