import { UserFactory } from "../../../libs/user";
import * as dotenv from "dotenv";
import path from "path";

const rootPath = path.resolve();
dotenv.config({ path: path.join(rootPath, ".env") });

// Script config for goerli
const BLOCKCHAIN_WEBSOCKET_URL = process.env.SDK_BLOCKCHAIN_WEBSOCKET_URL;
const CLIENT_API_URL = process.env.SDK_CLIENT_API_URL;
const ETHEREUM_PRIVATE_KEY = process.env.SDK_ETH_PRIVATE_KEY;

// CHECK jest.setTimeout(50000);

describe("Suit for tests deposits", () => {
  let user: any; // TODO type

  beforeAll(async () => {
    user = await UserFactory.create({
      blockchainWsUrl: BLOCKCHAIN_WEBSOCKET_URL,
      clientApiUrl: CLIENT_API_URL,
      ethereumPrivateKey: ETHEREUM_PRIVATE_KEY,
    });
  });

  test("should check the status for the user", async () => {
    const status = await user.checkStatus();
    expect(status.isClientAlive).toBe(true);
    expect(status.isWeb3WsAlive).toBe(true);
  });

  // test("should create a deposit", async () => {
  //   const res = await user.makeDeposit({
  //     tokenAddress,
  //     tokenStandard,
  //     value,
  //   });
  //   expect(res).toHaveProperty("transactionHash");
  //   expect(res).toHaveProperty("transactionHashL2");
  // });

  afterAll(async () => {
    user.close();
  });
});
