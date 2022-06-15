import axios from "axios";
import * as APIService from "../../../useCases/GetCommitmentsAndExportFile/GetCommitments/index";
import { commitments } from "../../../__mocks__/useCases/ExportCommitments/commitments";
jest.mock("axios");
import { concatArrays } from "../../../useCases/GetCommitmentsAndExportFile/ConcatTwoArrays";
import {
  convertObjectToString,
  exportCommitments,
} from "../../../useCases/GetCommitmentsAndExportFile/ExportCommitments";
import fs from "fs";
import getCommitmentsAndExportFile from "../../../useCases/GetCommitmentsAndExportFile";

describe("Suit of tests for get commitmens from some endpoint", () => {
  const mockedAxios = axios as unknown as jest.Mocked<typeof axios>;

  test("Should get a json from getCommitmentsOnChain endpoint", async () => {
    // arrange
    mockedAxios.get.mockResolvedValue(commitments);

    const commitmentsOnChain = await APIService.getCommitmentsOnChain();
    const commitmentsOffChain = await APIService.getCommitmentsOffChain();

    const concatedArrays = concatArrays(
      commitmentsOnChain,
      commitmentsOffChain,
    );

    const FILE_PATH = "./__test__/file.json";
    exportCommitments(FILE_PATH, convertObjectToString(concatedArrays));
    const data = fs.readFileSync(FILE_PATH);

    expect(data.toString("utf8")).toBe(JSON.stringify(concatedArrays));
    // removing the file
    fs.unlinkSync(FILE_PATH);

    const FILE_PATH_FOR_USE_CASE_FOLDER = "./file.json";
    getCommitmentsAndExportFile(FILE_PATH_FOR_USE_CASE_FOLDER);
    const realData = fs.readFileSync(FILE_PATH_FOR_USE_CASE_FOLDER);
    expect(realData.toString("utf8")).toBe(JSON.stringify(concatedArrays));
    fs.unlinkSync(FILE_PATH_FOR_USE_CASE_FOLDER);
    console.log("E2E test for export commitments file checked");
  });
});
