import fs from "fs";
import { User } from "../../../libs/user";

import * as dotenv from "dotenv";
import path from "path";
import { Client } from "../../../libs/client";
import { NIGHTFALL_DEFAULT_CONFIG } from "../../../libs/user/constants";
import Commitment from "../../../libs/types";

const _rootPath = path.resolve();
dotenv.config({ path: path.join(_rootPath, ".env") });

const environment = {
  blockchainNetwork: process.env.SDK_ENV_BLOCKCHAIN_NETWORK,
  blockchainWsUrl: process.env.SDK_ENV_BLOCKCHAIN_WEBSOCKET_URL,
  clientApiUrl: process.env.SDK_ENV_CLIENT_API_URL,
};

describe("Suit of integration tests for export commitments use case", () => {
  const FILE_PATH = "./commitmentsBackup.json";
  let user: User;
  let client: Client;
  let commitmens: Commitment[];
  beforeAll(async () => {
    client = new Client(NIGHTFALL_DEFAULT_CONFIG.clientApiUrl);
    user = new User(environment); // now goerli
    await user.init({
      ethereumPrivateKey: process.env.SDK_ETH_PRIVATE_KEY,
      nightfallMnemonic: process.env.SDK_NIGHTFALL_MNEMONIC,
    });
    commitmens = await client.getCommitmentsByCompressedZkpPublicKey([
      user.zkpKeys.compressedZkpPublicKey,
    ]);
  });

  test("Verify if the file is created with the commitments by this compressedPkd", async () => {
    await user.exportCommitments(
      [user.zkpKeys.compressedZkpPublicKey],
      "./",
      "commitmentsBackup.json",
    );

    const data = fs.readFileSync(FILE_PATH);
    expect(data.toString("utf8")).toBe(JSON.stringify(commitmens));
  });

  test("Verify if the commitments match with the compressedZkpPublicKey", async () => {
    const data = fs.readFileSync(FILE_PATH);
    const jsonData: Commitment[] = JSON.parse(data.toString("utf8"));
    expect(jsonData[0].preimage.compressedZkpPublicKey).toBe(
      user.zkpKeys.compressedZkpPublicKey,
    );
  });

  test("Should pass an invalid list of compressedZkpPublicKey and receive null", async () => {
    const response = await user.exportCommitments(
      ["teste"],
      "./",
      "commitmentsBackup.json",
    );

    expect(response).toBe(null);
  });

  test("Should pass an empty aarray and receive null", async () => {
    const response = await user.exportCommitments(
      [],
      "./",
      "commitmentsBackup.json",
    );

    expect(response).toBe(null);
  });

  afterAll(() => {
    user.close();
    // removing the file
    fs.unlinkSync(FILE_PATH);
  });
});
