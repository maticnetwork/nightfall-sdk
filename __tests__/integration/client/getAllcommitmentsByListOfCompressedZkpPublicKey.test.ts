import * as dotenv from "dotenv";
import path from "path";
import { Client } from "../../../libs/client/index";
import ICommitment from "../../../libs/models/commitment";
import { User } from "../../../libs/user";
import { NIGHTFALL_DEFAULT_CONFIG } from "../../../libs/user/constants";

const _rootPath = path.resolve();
dotenv.config({ path: path.join(_rootPath, ".env") });

const environment = {
  blockchainNetwork: process.env.SDK_ENV_BLOCKCHAIN_NETWORK,
  blockchainWsUrl: process.env.SDK_ENV_BLOCKCHAIN_WEBSOCKET_URL,
  clientApiUrl: process.env.SDK_ENV_CLIENT_API_URL,
};

describe("Suit of tests for get commitmens from some endpoint", () => {
  let user: User;
  let client: Client;
  let commitmens: ICommitment[];

  beforeAll(async () => {
    client = new Client(NIGHTFALL_DEFAULT_CONFIG.clientApiUrl);
    user = new User(environment); // now goerli
    await user.init({
      ethereumPrivateKey: process.env.SDK_ETH_PRIVATE_KEY,
      nightfallMnemonic: process.env.SDK_NIGHTFALL_MNEMONIC,
    });
  });

  test("Should get a json from getCommitmentsOnChain endpoint", async () => {
    commitmens = await client.getCommitmentsByCompressedZkpPublicKey([
      user.zkpKeys.compressedZkpPublicKey,
    ]);
    expect(commitmens).toBeInstanceOf(Object as unknown as ICommitment[]);
    expect(commitmens[0].preimage.compressedZkpPublicKey).toEqual(
      user.zkpKeys.compressedZkpPublicKey,
    );
  });

  test("Should passs a empty array of strings and receive null", async () => {
    commitmens = await client.getCommitmentsByCompressedZkpPublicKey([]);
    expect(commitmens).toBe(null);
  });

  test("Should passs an invalid list of compreesedZkpPublicKey and receive an empty array", async () => {
    commitmens = await client.getCommitmentsByCompressedZkpPublicKey(["teste"]);

    expect(commitmens.length).toBe(0);
    expect(commitmens).toStrictEqual([]);
  });

  afterAll(() => {
    user.close();
  });
});
