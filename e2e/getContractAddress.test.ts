import { Client } from "../libs/client";

describe("Verify client API get contract address", () => {
  it("Shoud return the contract address if the client is running", async () => {
    const client = new Client(process.env.APP_CLIENT_API_URL);
    expect(await client.getContractAddress("Shield")).toBeTruthy();
  });
});
