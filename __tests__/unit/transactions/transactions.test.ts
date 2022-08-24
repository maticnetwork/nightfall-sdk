import {
  createAndSubmitDeposit,
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
            fee,
          ),
      ).rejects.toThrow(NightfallSdkError);
      expect(mockedClient.deposit).toHaveBeenCalledTimes(1);
    });

    test.skip("Should throw an error if an exception is caught when submitting tx", () => {
      // Arrange
      const mockedDepositResData = {
        txDataToSign: unsignedTx,
        transaction: txReceiptL2,
      };
      mockedClient.deposit.mockResolvedValue(mockedDepositResData);
      (submitTransaction as jest.Mock).mockRejectedValueOnce(
        new Error("Web3 failed at sending signed deposit tx"),
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
            fee,
          ),
      ).rejects.toThrow(NightfallSdkError);
      expect(mockedClient.deposit).toHaveBeenCalledWith(
        token,
        ownerZkpKeys,
        value,
        fee,
      );
      // expect(submitTransaction).toHaveBeenCalledTimes(1); // TODO
    });

    test("Should return an instance of <OnChainTransactionReceipts>", async () => {
      // Arrange
      const mockedDepositResData = {
        txDataToSign: unsignedTx,
        transaction: txReceiptL2,
      };
      mockedClient.deposit.mockResolvedValue(mockedDepositResData);
      (submitTransaction as jest.Mock).mockResolvedValueOnce(txReceipt);

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
        fee,
      );

      // Assert
      expect(mockedClient.deposit).toHaveBeenCalledWith(
        token,
        ownerZkpKeys,
        value,
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
            fee,
            recipientNightfallAddress,
            isOffChain,
          ),
      ).rejects.toThrow(NightfallSdkError);
      expect(mockedClient.transfer).toHaveBeenCalledTimes(1);
    });

    test.skip("Should throw an error if an exception is caught when submitting on-chain tx", () => {
      // Arrange
      const mockedTransferResData = {
        txDataToSign: unsignedTx,
        transaction: txReceiptL2,
      };
      mockedClient.transfer.mockResolvedValue(mockedTransferResData);
      (submitTransaction as jest.Mock).mockRejectedValueOnce(
        new Error("Web3 failed at sending signed transfer tx"),
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
            fee,
            recipientNightfallAddress,
            isOffChain,
          ),
      ).rejects.toThrow(NightfallSdkError);
      expect(mockedClient.transfer).toHaveBeenCalledWith(
        token,
        ownerZkpKeys,
        recipientNightfallData,
        fee,
        isOffChain,
      );
      // expect(submitTransaction).toHaveBeenCalledTimes(1); // TODO
    });

    test.skip("Should return an instance of <OnChainTransactionReceipts> when submitting on-chain tx", async () => {
      // Arrange
      const mockedTransferResData = {
        txDataToSign: unsignedTx,
        transaction: txReceiptL2,
      };
      mockedClient.transfer.mockResolvedValue(mockedTransferResData);
      (submitTransaction as jest.Mock).mockResolvedValueOnce(txReceipt);

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
        fee,
        recipientNightfallAddress,
        isOffChain,
      );

      // Assert
      expect(mockedClient.transfer).toHaveBeenCalledWith(
        token,
        ownerZkpKeys,
        recipientNightfallData,
        fee,
        isOffChain,
      );
      expect(submitTransaction).toHaveBeenCalledWith(
        ownerEthAddress,
        ownerEthPrivateKey,
        shieldContractAddress,
        unsignedTx,
        web3,
      );
      expect(txReceipts).toStrictEqual({ txReceipt, txReceiptL2 });
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
        fee,
        recipientNightfallAddress,
        isOffChain,
      );

      // Assert
      expect(mockedClient.transfer).toHaveBeenCalledWith(
        token,
        ownerZkpKeys,
        recipientNightfallData,
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
            fee,
            recipientEthAddress,
            isOffChain,
          ),
      ).rejects.toThrow(NightfallSdkError);
      expect(mockedClient.withdraw).toHaveBeenCalledTimes(1);
    });

    test.skip("Should throw an error if an exception is caught when submitting on-chain tx", () => {
      // Arrange
      const mockedWithdrawResData = {
        txDataToSign: unsignedTx,
        transaction: txReceiptL2,
      };
      mockedClient.withdraw.mockResolvedValue(mockedWithdrawResData);
      (submitTransaction as jest.Mock).mockRejectedValueOnce(
        new Error("Web3 failed at sending signed withdrawal tx"),
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
            fee,
            recipientEthAddress,
            isOffChain,
          ),
      ).rejects.toThrow(NightfallSdkError);
      expect(mockedClient.withdraw).toHaveBeenCalledWith(
        token,
        ownerZkpKeys,
        value,
        fee,
        recipientEthAddress,
        isOffChain,
      );
      // expect(submitTransaction).toHaveBeenCalledTimes(1); // TODO
    });

    test.skip("Should return an instance of <OnChainTransactionReceipts> when submitting on-chain tx", async () => {
      // Arrange
      const mockedWithdrawResData = {
        txDataToSign: unsignedTx,
        transaction: txReceiptL2,
      };
      mockedClient.withdraw.mockResolvedValue(mockedWithdrawResData);
      (submitTransaction as jest.Mock).mockResolvedValueOnce(txReceipt);

      // Act
      const txReceipts = await await createAndSubmitWithdrawal(
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
        fee,
        recipientEthAddress,
        isOffChain,
      );

      // Assert
      expect(mockedClient.withdraw).toHaveBeenCalledWith(
        token,
        ownerZkpKeys,
        value,
        fee,
        recipientEthAddress,
        isOffChain,
      );
      expect(submitTransaction).toHaveBeenCalledWith(
        ownerEthAddress,
        ownerEthPrivateKey,
        shieldContractAddress,
        unsignedTx,
        web3,
      );
      expect(txReceipts).toStrictEqual({ txReceipt, txReceiptL2 });
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
        fee,
        recipientEthAddress,
        isOffChain,
      );

      // Assert
      expect(mockedClient.withdraw).toHaveBeenCalledWith(
        token,
        ownerZkpKeys,
        value,
        fee,
        recipientEthAddress,
        isOffChain,
      );
      expect(submitTransaction).not.toHaveBeenCalled();
      expect(txReceipts).toStrictEqual({ txReceiptL2 });
    });
  });

  describe("Finalise withdrawal", () => {
    const withdrawTxHash = "0x0withdrawTxHash";

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
            withdrawTxHash,
          ),
      ).rejects.toThrow(NightfallSdkError);
      expect(mockedClient.finaliseWithdrawal).toHaveBeenCalledTimes(1);
    });

    test.skip("Should throw an error if an exception is caught when submitting tx", () => {
      // Arrange
      const mockedFinaliseWithdrawalResData = { txDataToSign: unsignedTx };
      mockedClient.finaliseWithdrawal.mockResolvedValue(
        mockedFinaliseWithdrawalResData,
      );
      (submitTransaction as jest.Mock).mockRejectedValueOnce(
        new Error("Web3 failed at sending signed finalise-withdrawal tx"),
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
            withdrawTxHash,
          ),
      ).rejects.toThrow(NightfallSdkError);
      expect(mockedClient.finaliseWithdrawal).toHaveBeenCalledWith(
        withdrawTxHash,
      );
      // expect(submitTransaction).toHaveBeenCalledTimes(1); // TODO
    });

    test("Should return an instance of <TransactionReceipt>", async () => {
      // Arrange
      const mockedFinaliseWithdrawalResData = { txDataToSign: unsignedTx };
      mockedClient.finaliseWithdrawal.mockResolvedValue(
        mockedFinaliseWithdrawalResData,
      );
      (submitTransaction as jest.Mock).mockResolvedValueOnce(txReceipt);

      // Act
      const result = await createAndSubmitFinaliseWithdrawal(
        ownerEthAddress,
        ownerEthPrivateKey,
        shieldContractAddress,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        web3,
        mockedClient,
        withdrawTxHash,
      );

      // Assert
      expect(mockedClient.finaliseWithdrawal).toHaveBeenCalledWith(
        withdrawTxHash,
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
