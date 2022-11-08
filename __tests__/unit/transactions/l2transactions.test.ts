import {
  createAndSubmitDeposit,
  createAndSubmitTokenise,
  createAndSubmitTransfer,
  createAndSubmitWithdrawal,
  createAndSubmitFinaliseWithdrawal,
} from "../../../libs/transactions";
import { submitTransaction } from "../../../libs/transactions/helpers/submit";
import { NightfallSdkError } from "../../../libs/utils/error";
import { depositReceipts } from "../../../__mocks__/mockTxDepositReceipts";
import { transferReceipts } from "../../../__mocks__/mockTxTransferReceipts";
import { withdrawalReceipts } from "../../../__mocks__/mockTxWithdrawalReceipts";
import { txReceipt } from "../../../__mocks__/mockTxWithdrawalFinaliseReceipt";

jest.mock("../../../libs/transactions/helpers/submit");

describe("Transactions", () => {
  const token = {};
  const ownerEthAddress = "0x0ownerEthAddress";
  const ownerEthPrivateKey = "0x0ownerEthPrivateKey";
  const ownerZkpKeys = {};
  const shieldContractAddress = "0x0shieldContractAddress";
  const web3 = {};

  const mockedClient = {
    deposit: jest.fn(),
    transfer: jest.fn(),
    withdraw: jest.fn(),
    finaliseWithdrawal: jest.fn(),
  };

  describe("Deposit", () => {
    const value = "70000000000000000";
    const fee = "10";
    const tokenId = "0x00";
    const unsignedTx =
      "0x9ae2b6be00000000000000000000000000000000000000000000000000f...";
    const { txReceipt, txReceiptL2 } = depositReceipts;

    test("Should fail if client throws a Nightfall error", () => {
      // Arrange
      mockedClient.deposit.mockRejectedValue(
        new NightfallSdkError("Oops, client failed at deposit"),
      );

      // Act, Assert
      expect(
        async () =>
          await createAndSubmitDeposit(
            token,
            ownerEthAddress,
            ownerEthPrivateKey,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ownerZkpKeys,
            shieldContractAddress,
            web3,
            mockedClient,
            value,
            tokenId,
            fee,
          ),
      ).rejects.toThrow(NightfallSdkError);
      expect(mockedClient.deposit).toHaveBeenCalledTimes(1);
    });

    test("Should return an instance of <OnChainTransactionReceipts>", async () => {
      // Arrange
      const mockedDepositResData = {
        txDataToSign: unsignedTx,
        transaction: txReceiptL2,
      };
      mockedClient.deposit.mockResolvedValue(mockedDepositResData);
      (submitTransaction as jest.Mock).mockResolvedValue(txReceipt);

      // Act
      const txReceipts = await createAndSubmitDeposit(
        token,
        ownerEthAddress,
        ownerEthPrivateKey,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ownerZkpKeys,
        shieldContractAddress,
        web3,
        mockedClient,
        value,
        tokenId,
        fee,
      );

      // Assert
      expect(mockedClient.deposit).toHaveBeenCalledWith(
        token,
        ownerZkpKeys,
        value,
        tokenId,
        fee,
      );
      expect(submitTransaction).toHaveBeenCalledWith(
        ownerEthAddress,
        ownerEthPrivateKey,
        shieldContractAddress,
        unsignedTx,
        web3,
        fee,
      );
      expect(txReceipts).toStrictEqual({ txReceipt, txReceiptL2 });
    });
  });

  describe("Transfer", () => {
    const value = "100000000000000";
    const fee = "10";
    const tokenId = "0x00";
    const recipientNightfallAddress = "0x0recipientNightfallAddress";
    const recipientNightfallData = {
      recipientCompressedZkpPublicKeys: [recipientNightfallAddress],
      values: [value],
    };
    let isOffChain = true;

    const unsignedTx =
      "0x94d872be00000000000000000000000000000000000000000000000000f...";
    const { txReceipt, txReceiptL2 } = transferReceipts;

    test("Should fail if client throws a Nightfall error", () => {
      // Arrange
      mockedClient.transfer.mockRejectedValue(
        new NightfallSdkError("Oops, client failed at transfer"),
      );

      // Act, Assert
      expect(
        async () =>
          await createAndSubmitTransfer(
            token,
            ownerEthAddress,
            ownerEthPrivateKey,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ownerZkpKeys,
            shieldContractAddress,
            web3,
            mockedClient,
            value,
            tokenId,
            fee,
            recipientNightfallAddress,
            isOffChain,
          ),
      ).rejects.toThrow(NightfallSdkError);
      expect(mockedClient.transfer).toHaveBeenCalledTimes(1);
    });

    test("Should return an instance of <OffChainTransactionReceipt> when sending off-chain tx", async () => {
      // Arrange
      isOffChain = true;
      const mockedTransferResData = { transaction: txReceiptL2 };
      mockedClient.transfer.mockResolvedValue(mockedTransferResData);

      // Act
      const txReceipts = await createAndSubmitTransfer(
        token,
        ownerEthAddress,
        ownerEthPrivateKey,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ownerZkpKeys,
        shieldContractAddress,
        web3,
        mockedClient,
        value,
        tokenId,
        fee,
        recipientNightfallAddress,
        isOffChain,
      );

      // Assert
      expect(mockedClient.transfer).toHaveBeenCalledWith(
        token,
        ownerZkpKeys,
        recipientNightfallData,
        tokenId,
        fee,
        isOffChain,
      );
      expect(submitTransaction).not.toHaveBeenCalled();
      expect(txReceipts).toStrictEqual({ txReceiptL2 });
    });
  });

  describe("Withdrawal", () => {
    const value = "100000000000000";
    const fee = "10";
    const recipientEthAddress = "0x0recipientEthAddress";
    const tokenId = "0x00";
    // eslint-disable-next-line prefer-const
    let isOffChain = true;

    const unsignedTx =
      "0x5af3107a400000000000000000000000000000000000000000000000000...";
    const { txReceipt, txReceiptL2 } = withdrawalReceipts;

    test("Should fail if client throws a Nightfall error", () => {
      // Arrange
      mockedClient.withdraw.mockRejectedValue(
        new NightfallSdkError("Oops, client failed at withdrawal"),
      );

      // Act, Assert
      expect(
        async () =>
          await createAndSubmitWithdrawal(
            token,
            ownerEthAddress,
            ownerEthPrivateKey,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ownerZkpKeys,
            shieldContractAddress,
            web3,
            mockedClient,
            value,
            tokenId,
            fee,
            recipientEthAddress,
            isOffChain,
          ),
      ).rejects.toThrow(NightfallSdkError);
      expect(mockedClient.withdraw).toHaveBeenCalledTimes(1);
    });

    test("Should return an instance of <OffChainTransactionReceipt> when sending off-chain tx", async () => {
      // Arrange
      isOffChain = true;
      const mockedWithdrawResData = { transaction: txReceiptL2 };
      mockedClient.withdraw.mockResolvedValue(mockedWithdrawResData);

      // Act
      const txReceipts = await createAndSubmitWithdrawal(
        token,
        ownerEthAddress,
        ownerEthPrivateKey,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ownerZkpKeys,
        shieldContractAddress,
        web3,
        mockedClient,
        value,
        tokenId,
        fee,
        recipientEthAddress,
        isOffChain,
      );

      // Assert
      expect(mockedClient.withdraw).toHaveBeenCalledWith(
        token,
        ownerZkpKeys,
        value,
        tokenId,
        fee,
        recipientEthAddress,
        isOffChain,
      );
      expect(submitTransaction).not.toHaveBeenCalled();
      expect(txReceipts).toStrictEqual({ txReceiptL2 });
    });
  });

  describe("Finalise withdrawal", () => {
    const withdrawTxHashL2 = "0x0aaabbbcd";

    const unsignedTx =
      "0xa334229a00000000000000000000000000000000000000000000000000000...";

    test("Should fail if client throws a Nightfall error", () => {
      // Arrange
      mockedClient.finaliseWithdrawal.mockRejectedValue(
        new NightfallSdkError("Oops, client failed at finalise-withdrawal"),
      );

      // Act, Assert
      expect(
        async () =>
          await createAndSubmitFinaliseWithdrawal(
            ownerEthAddress,
            ownerEthPrivateKey,
            shieldContractAddress,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            web3,
            mockedClient,
            withdrawTxHashL2,
          ),
      ).rejects.toThrow(NightfallSdkError);
      expect(mockedClient.finaliseWithdrawal).toHaveBeenCalledTimes(1);
    });

    test("Should return an instance of <TransactionReceipt>", async () => {
      // Arrange
      const mockedFinaliseWithdrawalResData = { txDataToSign: unsignedTx };
      mockedClient.finaliseWithdrawal.mockResolvedValue(
        mockedFinaliseWithdrawalResData,
      );
      (submitTransaction as jest.Mock).mockResolvedValue(txReceipt);

      // Act
      const result = await createAndSubmitFinaliseWithdrawal(
        ownerEthAddress,
        ownerEthPrivateKey,
        shieldContractAddress,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        web3,
        mockedClient,
        withdrawTxHashL2,
      );

      // Assert
      expect(mockedClient.finaliseWithdrawal).toHaveBeenCalledWith(
        withdrawTxHashL2,
      );
      expect(submitTransaction).toHaveBeenCalledWith(
        ownerEthAddress,
        ownerEthPrivateKey,
        shieldContractAddress,
        unsignedTx,
        web3,
      );
      expect(result).toStrictEqual(txReceipt);
    });
  });
});
