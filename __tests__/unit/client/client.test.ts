import axios from "axios";
import { Client } from "../../../libs/client/index";
import mockCommitments from "../../../__mocks__/mockCommitments";

const commitments: Array<object> = mockCommitments.data.commitments;
const DUMMY_COMPRESSED_PKD = "dummyCompressedPkd";

jest.mock("axios");

describe("Suit of tests for get commitmens from some endpoint", () => {
  const mockedAxios = axios as unknown as jest.Mocked<typeof axios>;
  test("Should get a json from getCommitmentsOnChain endpoint", async () => {
    mockedAxios.get.mockResolvedValue(commitments);
    const client = new Client(process.env.SDK_ENV_API_URL);
    const response = await client.getAllCommitmentsByCompressedPkd(
      DUMMY_COMPRESSED_PKD,
    );
    expect(response).toBeInstanceOf(Object);
    expect(response).toEqual(commitments);
  });
});
