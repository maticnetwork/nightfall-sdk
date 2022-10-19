import { UserFactory } from "../libs/user";
import { Balance, User } from "../libs/user/types";

let user1: User;
let user2: User;
let user3: User;
let user4: User;
let user4Balance: any;
let user3Balance: any;

const TX_PER_BLOCK = 2;
const DECIMALS = 1000000000;

// Values for deposit
const DEPOSIT_VALUE = 100000;
const TRANSACTION_DEPOSIT_VALUE = DEPOSIT_VALUE / DECIMALS; // 0,0001
const TRANSACTION_DEPOSIT_BALANCE = DEPOSIT_VALUE * DECIMALS;

// Values for transfer
const TRANSFER_VALUE = 20000;
const TRANSACTION_TRANSFER_VALUE = TRANSFER_VALUE / DECIMALS; // 0,0001
const TRANSACTION_TRANSFER_BALANCE = TRANSFER_VALUE * DECIMALS;

const waitForTimeout = async (timeoutInMs: number) => {
  await new Promise((resolve) => setTimeout(resolve, timeoutInMs));
};

describe("nightfall smoke tests", function () {
  jest.setTimeout(1500 * 100000);

  beforeAll(async function () {
    user1 = await UserFactory.create({
      blockchainWsUrl: process.env.APP_BLOCKCHAIN_WEBSOCKET_URL,
      clientApiUrl: process.env.APP_CLIENT_API_URL,
      ethereumPrivateKey: process.env.APP_ETH_PRIVATE_KEY,
      nightfallMnemonic: process.env.APP_NIGHTFALL_MNEMONIC,
    });

    user2 = await UserFactory.create({
      blockchainWsUrl: process.env.APP_BLOCKCHAIN_WEBSOCKET_URL,
      clientApiUrl: process.env.APP_CLIENT_API_URL,
      ethereumPrivateKey: process.env.APP_ETH_PRIVATE_KEY,
    });

    user3 = await UserFactory.create({
      blockchainWsUrl: process.env.APP_BLOCKCHAIN_WEBSOCKET_URL,
      clientApiUrl: process.env.APP_CLIENT_API_URL,
      ethereumPrivateKey: process.env.APP_ETH_PRIVATE_KEY,
    });

    let user3BalanceTmp = await user3.checkNightfallBalances();
    user3Balance =
      Object.values(user3BalanceTmp).length > 0
        ? (Object.values(user3BalanceTmp)[0] as Balance[])[0].balance
        : 0;

    user4 = await UserFactory.create({
      blockchainWsUrl: process.env.APP_BLOCKCHAIN_WEBSOCKET_URL,
      clientApiUrl: process.env.APP_CLIENT_API_URL,
      ethereumPrivateKey: process.env.APP_ETH_PRIVATE_KEY,
    });

    let user4BalanceTmp = await user4.checkNightfallBalances();
    user4Balance =
      Object.values(user4BalanceTmp).length > 0
        ? (Object.values(user4BalanceTmp)[0] as Balance[])[0].balance
        : 0;
  });

  it(`should make ${TX_PER_BLOCK} deposit from L1 to nightfall with the goal of generate at least 1 block. From this 32 deposit only one should be of the user3. So the user3 balance after the block generation, should be exactly the balance before plus the deposit value. After the test should make ${TX_PER_BLOCK} transfers. One from user3 to user4 and 31 from user2 to user1. This way we can verify the user4 nightfall balance that should be exactly the balance before plus the transfer value.`, async function () {
    await user3.makeDeposit({
      tokenContractAddress: process.env.APP_TOKEN_ADDRESS,
      tokenErcStandard: "ERC20",
      value: TRANSACTION_DEPOSIT_VALUE.toString(),
    });

    for (let i = 0; i < TX_PER_BLOCK - 1; i++) {
      await user1.makeDeposit({
        tokenContractAddress: process.env.APP_TOKEN_ADDRESS,
        tokenErcStandard: "ERC20",
        value: TRANSACTION_DEPOSIT_VALUE.toString(),
      });
    }

    await new Promise<void>(async (resolve) => {
      async function verifyBlockCreation() {
        if (
          Object.values(await user3.checkNightfallBalances()).length > 0 &&
          (
            Object.values(await user3.checkNightfallBalances())[0] as Balance[]
          )[0].balance ==
            user3Balance + DEPOSIT_VALUE
        ) {
          resolve();
        } else {
          await waitForTimeout(10000);
          await verifyBlockCreation();
        }
      }
      await verifyBlockCreation();
    });

    const user3BalanceAfterDepositsVerification =
      (Object.values(await user3.checkNightfallBalances())[0] as Balance[])[0]
        .balance ===
      user3Balance + DEPOSIT_VALUE;

    await user3.makeTransfer({
      tokenContractAddress: process.env.APP_TOKEN_ADDRESS,
      tokenErcStandard: "ERC20",
      value: TRANSACTION_TRANSFER_VALUE.toString(),
      recipientNightfallAddress: user4.getNightfallAddress(),
    });

    for (let i = 0; i < TX_PER_BLOCK - 1; i++) {
      await user1.makeTransfer({
        tokenContractAddress: process.env.APP_TOKEN_ADDRESS,
        tokenErcStandard: "ERC20",
        value: TRANSACTION_TRANSFER_VALUE.toString(),
        recipientNightfallAddress: user2.getNightfallAddress(),
      });
    }

    await new Promise<void>(async (resolve) => {
      async function verifyBlockCreation2() {
        if (
          (Object.values(await user4.checkNightfallBalances()).length > 0 &&
            (
              Object.values(
                await user4.checkNightfallBalances(),
              )[0] as Balance[]
            )[0].balance) ==
          user4Balance + TRANSFER_VALUE
        ) {
          resolve();
        } else {
          await waitForTimeout(10000);
          await verifyBlockCreation2();
        }
      }
      await verifyBlockCreation2();
    });

    expect(user3BalanceAfterDepositsVerification).toBeTruthy();
    expect(
      (Object.values(await user4.checkNightfallBalances())[0] as Balance[])[0]
        .balance,
    ).toEqual(user4Balance + TRANSFER_VALUE);
  });

  afterAll(() => {
    user1.close();
    user2.close();
    user3.close();
    user4.close();
  });
});
