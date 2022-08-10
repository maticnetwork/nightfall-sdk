import fs from "fs";
import * as dotenv from "dotenv";
import path from "path";

import mockCommitments from "../../../__mocks__/mockCommitments";
import { UserFactory } from "../../../libs/user";
const DUMMY_LIST_OF_COMPRESSED_ZKP_PK: string[] = [];

const _rootPath = path.resolve();
dotenv.config({ path: path.join(_rootPath, ".env") });

const options = {
  blockchainWsUrl: process.env.APP_BLOCKCHAIN_WEBSOCKET_URL,
  clientApiUrl: process.env.APP_CLIENT_API_URL,
  ethereumPrivateKey: process.env.APP_ETH_PRIVATE_KEY,
  nightfallMnemonic: process.env.APP_NIGHTFALL_MNEMONIC,
};
jest.mock("../../../libs/client/client");
import getAllCommitmentsByCompressedPkdStub from "../../../__mocks__/__stubs__/client";

describe("Suit of tests for user class", () => {
  let user: any;

  beforeAll(async () => {
    //user = await UserFactory.create(options);
    getAllCommitmentsByCompressedPkdStub;
  });
  test("Verify if the file is created with the commitments by this compressedPkd", async () => {
    // await user.exportCommitments({
    //   listOfCompressedZkpPublicKey: DUMMY_LIST_OF_COMPRESSED_ZKP_PK,
    //   pathToExport: "./",
    //   fileName: "commitmentsBackup.json",
    // });
    // const FILE_PATH = "./commitmentsBackup.json";
    // const data = fs.readFileSync(FILE_PATH);
    // expect(data.toString("utf8")).toBe(
    //   JSON.stringify(
    //     mockCommitments.data.commitmentsByListOfCompressedZkpPublicKey,
    //   ),
    // );
    // // removing the file
    // fs.unlinkSync(FILE_PATH);
  });
});
