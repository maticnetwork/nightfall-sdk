import { UserFactory } from "../../../libs/user";

const options = {
  blockchainWsUrl: process.env.APP_BLOCKCHAIN_WEBSOCKET_URL,
  clientApiUrl: process.env.APP_CLIENT_API_URL,
  ethereumPrivateKey: process.env.APP_ETH_PRIVATE_KEY,
  nightfallMnemonic: process.env.APP_NIGHTFALL_MNEMONIC,
};

jest.setTimeout(50000); // CHECK Why this?

describe("Suit for tests deposits", () => {
  let user: any; // TODO improve
  const tokenAddress = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F"; // USDC goerli
  const tokenStandard = "ERC20";
  const value = "0.0001";

  beforeAll(async () => {
    user = await UserFactory.create(options);
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
