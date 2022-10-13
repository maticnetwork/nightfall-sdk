import { Client } from "../libs/client";
import testVars from "./config";

describe("Verify client API get contract address", () => {
  it("Shoud return the contract address if the client is running", async () => {
    const client = new Client(process.env.APP_CLIENT_API_URL);
    const zkpKeys = await client.generateZkpKeysFromMnemonic(
      testVars.NIGHTFALL_MNEMONIC,
      0,
    );

    console.log(zkpKeys);
    expect(zkpKeys.zkpPrivateKey).toEqual(testVars.ZKPKEYS.zkpPrivateKey);
    expect(zkpKeys.zkpPublicKey).toEqual(testVars.ZKPKEYS.zkpPublicKey);
    expect(zkpKeys.compressedZkpPublicKey).toEqual(
      testVars.ZKPKEYS.compressedZkpPublicKey,
    );
    expect(zkpKeys.nullifierKey).toEqual(testVars.ZKPKEYS.nullifierKey);
    expect(zkpKeys.rootKey).toEqual(testVars.ZKPKEYS.rootKey);
  });
});
