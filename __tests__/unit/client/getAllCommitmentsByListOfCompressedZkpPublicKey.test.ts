import { Client } from "../../../libs/client/index";
import mockCommitments from "../../../__mocks__/mockCommitments";
import { Commitment } from "../../../libs/types";
import getAllCommitmentsByCompressedPkdStub from "../../../__mocks__/__stubs__/client";

const commitments: Array<object> =
  mockCommitments.data.commitmentsByListOfCompressedZkpPublicKey;
const DUMMY_LIST_OF_COMPRESSED_ZKP_PK: string[] = [];

describe("Suit of tests for get commitmens from some endpoint", () => {
  beforeAll(() => {
    getAllCommitmentsByCompressedPkdStub;
  });

  test("Should get a json from getCommitmentsOnChain endpoint", async () => {
    const client = new Client(process.env.APP_CLIENT_API_URL);
    const response = await client.getCommitmentsByCompressedZkpPublicKey(
      DUMMY_LIST_OF_COMPRESSED_ZKP_PK,
    );
    expect(response).toBeInstanceOf(Object as unknown as Commitment[]);
    expect(response).toEqual(commitments);
  });
});
