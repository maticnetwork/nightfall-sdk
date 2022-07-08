import axios from "axios";
import { Client } from "../../../libs/client/index";
import mockCommitments from "../../../__mocks__/commitments";

const commitments: Array<object> = mockCommitments;

jest.mock("axios");

describe("Suit of tests for get commitmens from some endpoint", () => {
  const mockedAxios = axios as unknown as jest.Mocked<typeof axios>;
  test("Should get a json from getCommitmentsOnChain endpoint", async () => {
    // arrange
    mockedAxios.get.mockResolvedValue(commitments);
    const client = new Client(process.env.SDK_ENV_API_URL);
    const response = await client.getAllCommitmentsByCompressedPkd(
      "compressedPkd",
    );
    expect(response).toBeInstanceOf(Object);
    expect(response).toEqual(commitments);
  });
});
