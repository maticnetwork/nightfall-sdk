import { User } from "../../../libs/user";
import * as dotenv from "dotenv";
import path from "path";

const _rootPath = path.resolve();
dotenv.config({ path: path.join(_rootPath, ".env") });

// Script config for goerli
const environment = {
  blockchainNetwork: process.env.SDK_ENV_BLOCKCHAIN_NETWORK || '',
  blockchainWs: process.env.SDK_ENV_BLOCKCHAIN_WEBSOCKET || '',
  apiUrl: process.env.SDK_ENV_API_URL || '',
};
const ethereumPrivateKey = process.env.SDK_ETH_PRIVATE_KEY || '';
const tokenAddress = process.env.SDK_ETH_TOKEN_ADDRESS || ''; // MATIC contract address in goerli
const tokenStandard = "ERC20";
const value = "0.0014";

jest.setTimeout(50000);

describe("Suit for tests deposits", () => {
  let user: User;

  beforeAll(async () => {    
    user = new User(environment); // now goerli   
    await user.init({
      ethereumPrivateKey,
    });
  });

  test("should check the status for the user", async () => {         
    const status = await user.checkStatus();
    expect(status.isClientAlive).toBe(true);
    expect(status.isWeb3WsAlive).toBe(true);
  });
  
  test("should create a deposit", async () => {         
      const res = await user.makeDeposit({
        tokenAddress,
        tokenStandard,
        value,
      }); // wei 20000000000000000
      expect(res).toHaveProperty('transactionHash');
  });

  afterAll(async () => {
    user.close();
  });
});