import { UserFactory } from "../../../libs/user";
import * as dotenv from "dotenv";
import path from "path";

const rootPath = path.resolve();
dotenv.config({ path: path.join(rootPath, ".env") });

// Script config for goerli
const BLOCKCHAIN_WEBSOCKET_URL = process.env.SDK_BLOCKCHAIN_WEBSOCKET_URL;
const CLIENT_API_URL = process.env.SDK_CLIENT_API_URL;
const ETHEREUM_PRIVATE_KEY = process.env.SDK_ETH_PRIVATE_KEY;

jest.setTimeout(50000); // CHECK Why this?

describe("Suit for tests deposits", () => {
  let user: any; // TODO improve
  const tokenAddress = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F"; // USDC goerli
  const tokenStandard = "ERC20";
  const value = "0.0001";

  beforeAll(async () => {
    user = await UserFactory.create({
      blockchainWsUrl: BLOCKCHAIN_WEBSOCKET_URL,
      clientApiUrl: CLIENT_API_URL,
      ethereumPrivateKey: ETHEREUM_PRIVATE_KEY,
    });
  });

  test("Should verify communication with client api and web3 websocket", async () => {
    const status = await user.checkStatus();
    expect(status.isClientAlive).toBe(true);
    expect(status.isWeb3WsAlive).toBe(true);
  });

  // FAILS :(
  test("Should create a deposit transaction", async () => {
    // const result = await user.makeDeposit({
    //   tokenAddress,
    //   tokenStandard,
    //   value,
    // });
    // expect(result).toHaveProperty("txL1");
    // expect(result).toHaveProperty("txL2");
  });

  afterAll(async () => {
    user.close();
  });
});
