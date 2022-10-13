import { UserFactory } from "../libs/user";
import { Balance, User } from "../libs/user/types";

let user1: User;
let user2: User;
let user1Balance: any;
let user2Balance: any;

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

    let user1BalanceTmp = await user1.checkNightfallBalances();
    user1Balance =
      Object.values(user1BalanceTmp).length > 0
        ? (Object.values(user1BalanceTmp)[0] as Balance[])[0].balance
        : 0;

    let user2BalanceTmp = await user2.checkNightfallBalances();
    user2Balance =
      Object.values(user2BalanceTmp).length > 0
        ? (Object.values(user2BalanceTmp)[0] as Balance[])[0].balance
        : 0;
  });

  it(`should make ${TX_PER_BLOCK} deposit from L1 to nightfall with the goal of generate at least 1 block. From this 32 deposit only one should be of the user3. So the user3 balance after the block generation, should be exactly the balance before plus the deposit value. After the test should make ${TX_PER_BLOCK} transfers. One from user3 to user4 and 31 from user2 to user1. This way we can verify the user4 nightfall balance that should be exactly the balance before plus the transfer value.`, async function () {
    for (let i = 0; i < TX_PER_BLOCK; i++) {
      await user1.makeDeposit({
        tokenContractAddress: process.env.APP_TOKEN_ADDRESS,
        tokenErcStandard: "ERC20",
        value: TRANSACTION_DEPOSIT_VALUE.toString(),
      });
    }

    await new Promise<void>(async (resolve) => {
      async function verifyBlockCreation() {
        if (
          Object.values(await user2.checkNightfallBalances()).length > 0 &&
          (
            Object.values(await user1.checkNightfallBalances())[0] as Balance[]
          )[0].balance ==
            user1Balance + DEPOSIT_VALUE * TX_PER_BLOCK
        ) {
          resolve();
        } else {
          await waitForTimeout(10000);
          await verifyBlockCreation();
        }
      }
      await verifyBlockCreation();
    });

    const user1BalanceAfterDepositsVerification =
      (Object.values(await user1.checkNightfallBalances())[0] as Balance[])[0]
        .balance ===
      user1Balance + DEPOSIT_VALUE * TX_PER_BLOCK;

    for (let i = 0; i < TX_PER_BLOCK; i++) {
      await user1.makeTransfer({
        tokenContractAddress: process.env.APP_TOKEN_ADDRESS,
        tokenErcStandard: "ERC20",
        value: TRANSACTION_TRANSFER_VALUE.toString(),
        recipientNightfallAddress: user2.getNightfallAddress(),
      });
    }

    console.log("SAI!");

    await new Promise<void>(async (resolve) => {
      async function verifyBlockCreation2() {
        if (
          (Object.values(await user2.checkNightfallBalances()).length > 0 &&
            (
              Object.values(
                await user2.checkNightfallBalances(),
              )[0] as Balance[]
            )[0].balance) ==
          user2Balance + TRANSFER_VALUE * TX_PER_BLOCK
        ) {
          resolve();
        } else {
          await waitForTimeout(10000);
          await verifyBlockCreation2();
        }
      }
      await verifyBlockCreation2();
    });

    expect(user1BalanceAfterDepositsVerification).toBeTruthy();
    expect(
      (Object.values(await user2.checkNightfallBalances())[0] as Balance[])[0]
        .balance,
    ).toEqual(user2Balance + TRANSFER_VALUE * TX_PER_BLOCK);
  });

  afterAll(() => {
    user1.close();
    user2.close();
  });
});
