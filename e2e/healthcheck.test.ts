import { Client } from "../libs/client";
import testVars from "./config";

describe("Verify client API healthcheck", () => {
  it("Shoud return 200 if the client is running", async () => {
    console.log("API: ", process.env.APP_CLIENT_API_URL);
    const client = new Client(process.env.APP_CLIENT_API_URL);
    expect(await client.healthCheck()).toBeTruthy();
  });
});
