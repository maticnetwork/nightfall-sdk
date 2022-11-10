import axios from "axios";
import { UserFactory } from "../../../libs/user";
import { randomSalt } from "../../../libs/utils/random";
import { Client } from "../../../libs/client";

// launch proposer as PROPOSER_HOST=nightfall_3-proposer-1 PROPOSER_PORT=8092 ./bin/start-apps
const options = {
  blockchainWsUrl: process.env.APP_BLOCKCHAIN_WEBSOCKET_URL,
  clientApiUrl: process.env.APP_CLIENT_API_URL,
  ethereumPrivateKey: process.env.APP_ETH_PRIVATE_KEY,
  nightfallMnemonic: process.env.APP_NIGHTFALL_MNEMONIC,
};

describe("Suit of integration tests tokenisation", () => {
  jest.setTimeout(60000);
  let user: any;
  let tokenAddress1: string;
  let tokenAddress2: string;
  let badTokenAddress1: string;
  let balanceToken1: any;
  let unspentCommitmentsStart:any;
  let unspentCommitmentsEnd:any;
  let nUnspentCommitmentsStart:number;
  let nUnspentCommitmentsEnd:number;
  const tokenId1 = 2345;
  const client = new Client(process.env.APP_CLIENT_API_URL);

  const makeBlock = async ()  => {
    // TODO: For now, i am assuming this works only on localhost, not on testnet
    await axios.get("http://localhost:8081/block/make-now");
  }

  beforeAll(async () => {
    user = await UserFactory.create(options);
    tokenAddress1 = "0x3000000000000000000000000e9c6b925f14a0304746fcfe430f721472fb7089";
    tokenAddress2 = "0x3000000000000000000000000e9c6b925f14a0304746fcfe430f721472fb7088";
    badTokenAddress1 = "0x1000000000000000000000000e9c6b925f14a0304746fcfe430f721472fb7089";
    const balances = await user.checkNightfallBalances();
    balanceToken1 = tokenAddress1 in balances ? balances[tokenAddress1][0] : {"balance":0};
  });

  test("Tokenise with invalid token address", async () => {
    const value = Number(process.env.APP_TX_VALUE) || 10;
    const feeWei = "0";
    const salt = await randomSalt();

    await expect(user.makeTokenise({
      tokenAddress: badTokenAddress1,
      tokenId: tokenId1, 
      value, 
      salt, 
      feeWei, 
    })).rejects.toThrowError();
  });

  test("Tokenise with invalid salt", async () => {
    const value = Number(process.env.APP_TX_VALUE) || 10;
    const feeWei = "0";
    const badSalt = "0x33333000000000000000000000000e9c6b925f14a0304746fcfe430f721472fb7089";

    await expect(user.makeTokenise({
      tokenAddress: tokenAddress1,
      tokenId: tokenId1, 
      value, 
      salt: badSalt, 
      feeWei, 
    })).rejects.toThrowError();
  });

  test("Burn with invalid token address", async () => {
    const value = Number(process.env.APP_TX_VALUE) || 10;
    const feeWei = "0";

    await expect(user.makeBurn({
      tokenAddress: badTokenAddress1,
      tokenId: tokenId1, 
      value, 
      feeWei, 
    })).rejects.toThrowError();
  });

  test("Tokenise", async () => {
    const value = Number(process.env.APP_TX_VALUE) || 10;
    const feeWei = "0";
    const salt = await randomSalt();

    const txReceipts1 = await user.makeTokenise({
      tokenAddress: tokenAddress1,
      tokenId: tokenId1, 
      value, 
      salt, 
      feeWei, 
    });
    expect(txReceipts1).toHaveProperty("txReceiptL2");

    await makeBlock();
    // TODO: wait 25 seconds to make a block
    await new Promise(resolve => setTimeout(resolve, 25000));

    const balances = await user.checkNightfallBalances();
    expect(balances).toHaveProperty(tokenAddress1);
    expect(balances[tokenAddress1][0]).toStrictEqual(
      {
        "balance": balanceToken1.balance + value,
        "tokenId": '0x' + tokenId1.toString(16).padStart(64,'0'),
      });

  });

  test("Burn innexistent token", async () => {
    const value = Number(process.env.APP_TX_VALUE) || 10;
    const feeWei = "0";

    await expect(user.makeBurn({
      tokenAddress: tokenAddress2,
      tokenId: tokenId1, 
      value, 
      feeWei, 
    })).rejects.toThrowError();
  });

  test("Burn 1 L2 minted commitment", async () => {
    const feeWei = "0";

    const myNightfallAddress =  user.getNightfallAddress();
    unspentCommitmentsStart = await client.getUnspentCommitments([myNightfallAddress],[tokenAddress1]);
    nUnspentCommitmentsStart = unspentCommitmentsStart[myNightfallAddress][tokenAddress1].length;
    expect(unspentCommitmentsStart).toHaveProperty([myNightfallAddress]);
    expect(unspentCommitmentsStart[myNightfallAddress]).toHaveProperty(tokenAddress1);

    // pick one commitment to burn. For now, at most 1 commitment can be burnt
    const valueBurn = unspentCommitmentsStart[myNightfallAddress][tokenAddress1][0].balance;
    const tokenIdBurn = unspentCommitmentsStart[myNightfallAddress][tokenAddress1][0].tokenId;


    const txReceipts1 = await user.makeBurn({
      tokenAddress: tokenAddress1,
      tokenId: tokenIdBurn, 
      value : valueBurn,
      feeWei, 
    });
    expect(txReceipts1).toHaveProperty("txReceiptL2");

    await makeBlock();
    // TODO: wait 25 seconds to make a block
    await new Promise(resolve => setTimeout(resolve, 25000));


    unspentCommitmentsEnd = await client.getUnspentCommitments([myNightfallAddress],[tokenAddress1]);
    nUnspentCommitmentsEnd = 0;
    if (myNightfallAddress in unspentCommitmentsEnd && tokenAddress1 in unspentCommitmentsEnd[myNightfallAddress]){
      nUnspentCommitmentsEnd = unspentCommitmentsEnd[myNightfallAddress][tokenAddress1].length;
    }
    expect(nUnspentCommitmentsEnd).toBe(nUnspentCommitmentsStart - 1);
  });

  afterAll(() => {
    user.close();
  });
});
