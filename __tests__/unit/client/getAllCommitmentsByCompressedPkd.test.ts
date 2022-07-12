import { Client } from "../../../libs/client/index";
import mockCommitments from "../../../__mocks__/mockCommitments";
import ICommitment from "../../../libs/models/commitment";
import getAllCommitmentsByCompressedPkdStub from "../../../__mocks__/__stubs__/client";

const commitments: Array<object> =
  mockCommitments.data.allCommitmentsByCompressedPkd;
const DUMMY_COMPRESSED_PKD = "";

jest.mock("axios");

describe("Suit of tests for get commitmens from some endpoint", () => {
  beforeAll(() => {
    getAllCommitmentsByCompressedPkdStub;
  });
  test("Should get a json from getCommitmentsOnChain endpoint", async () => {
    const client = new Client(process.env.SDK_ENV_API_URL);
    const response = await client.getAllCommitmentsByCompressedZkpPublicKey(
      DUMMY_COMPRESSED_PKD,
    );
    expect(response).toBeInstanceOf(Object as unknown as ICommitment[]);
    expect(response).toEqual(commitments);
  });
});
