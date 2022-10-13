import { Client } from "../libs/client";
import testVars from "./config";

describe("Verify client API get get nightfall balance", () => {
  jest.setTimeout(15 * 100000);

  it("Shoud return the address balance if the client is running", async () => {
    const client = new Client(process.env.APP_CLIENT_API_URL);
    const zkpKeys = await client.generateZkpKeysFromMnemonic(
      testVars.NIGHTFALL_MNEMONIC,
      0,
    );

    const balance = await client.getNightfallBalances(zkpKeys);
    console.log(balance);
    expect(balance).toBeTruthy();
  });
});
