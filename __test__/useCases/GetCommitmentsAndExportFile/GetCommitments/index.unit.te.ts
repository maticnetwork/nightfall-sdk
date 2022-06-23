import axios from "axios";
import {
  getCommitmentsOffChain,
  getCommitmentsOnChain,
} from "../../../../useCases/GetCommitmentsAndExportFile/GetCommitments/index";

import { commitments } from "../../../../__mocks__/useCases/ExportCommitments/commitments";

jest.mock("axios");

describe("Suit of tests for get commitmens from some endpoint", () => {
  const mockedAxios = axios as unknown as jest.Mocked<typeof axios>;
  test("Should get a json from getCommitmentsOnChain endpoint", async () => {
    // arrange
    mockedAxios.get.mockResolvedValue(commitments);

    const response = await getCommitmentsOnChain();
    expect(response).toBeInstanceOf(Object);
    expect(response).toEqual(commitments);
  });

  test("Should get a json from getCommitmentsOnChain endpoint", async () => {
    // arrange
    mockedAxios.get.mockResolvedValue(commitments);

    const response = await getCommitmentsOffChain();
    expect(response).toBeInstanceOf(Object);
    expect(response).toEqual(commitments);
  });
});
