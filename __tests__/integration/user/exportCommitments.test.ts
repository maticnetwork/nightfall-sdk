import fs from "fs";
import { UserFactory } from "../../../libs/user";
import { Client } from "../../../libs/client";
import { Commitment } from "../../../libs/types";

const options = {
  blockchainWsUrl: process.env.APP_BLOCKCHAIN_WEBSOCKET_URL,
  clientApiUrl: process.env.APP_CLIENT_API_URL,
  ethereumPrivateKey: process.env.APP_ETH_PRIVATE_KEY,
  nightfallMnemonic: process.env.APP_NIGHTFALL_MNEMONIC,
};

describe("Suit of integration tests for export commitments use case", () => {
  const FILE_PATH = "./commitmentsBackup.json";
  let user: any;
  let client: Client;
  let commitments: Commitment[];
  beforeAll(async () => {
    user = await UserFactory.create(options);
    client = new Client(options.clientApiUrl);
    commitments = await client.getCommitmentsByCompressedZkpPublicKey([
      user.zkpKeys.compressedZkpPublicKey,
    ]);
  });

  test("Verify if the file is created with the commitments by this compressedPkd", async () => {
    await user.exportCommitments({
      listOfCompressedZkpPublicKey: [user.zkpKeys.compressedZkpPublicKey],
      pathToExport: "./",
      fileName: "commitmentsBackup.json",
    });

    const data = fs.readFileSync(FILE_PATH);
    expect(data.toString("utf8")).toBe(JSON.stringify(commitments));
  });

  test("Verify if the commitments match with the compressedZkpPublicKey", async () => {
    const data = fs.readFileSync(FILE_PATH);
    const jsonData: Commitment[] = JSON.parse(data.toString("utf8"));
    expect(jsonData[0].compressedZkpPublicKey).toBe(
      user.zkpKeys.compressedZkpPublicKey,
    );
  });

  test("Should pass an invalid list of compressedZkpPublicKey and receive null", async () => {
    const response = await user.exportCommitments({
      listOfCompressedZkpPublicKey: ["teste"],
      pathToExport: "./",
      fileName: "commitmentsBackup.json",
    });

    expect(response).toBe(null);
  });

  test("Should pass an empty array and receive null", async () => {
    const response = await user.exportCommitments({
      listOfCompressedZkpPublicKey: [],
      pathToExport: "./",
      fileName: "commitmentsBackup.json",
    });

    expect(response).toBe(null);
  });

  afterAll(() => {
    user.close();
    // removing the file
    fs.unlinkSync(FILE_PATH);
  });
});
