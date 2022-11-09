import {
  createAndSubmitTokenise,
} from "../../../libs/transactions";
import { submitTransaction } from "../../../libs/transactions/helpers/submit";
import { NightfallSdkError } from "../../../libs/utils/error";
import { tokeniseReceipts } from "../../../__mocks__/mockTxTokeniseReceipts";
import { txReceipt } from "../../../__mocks__/mockTxWithdrawalFinaliseReceipt";

jest.mock("../../../libs/transactions/helpers/submit");

describe("L2 Transactions", () => {
  const ownerZkpKeys = {};
  const l2TokenAddress = "0x300000000000000000000000d7b31f55b06a8fe34282aa62f250961d7afebc0a";
  const salt = "0x4ae258391e959abdcc53dfdd017ca2c976bf1b677dfc70b861721132dc1c10d";

  const mockedClient = {
    tokenise: jest.fn(),
  };

  describe("Tokenise", () => {
    const value = 10;
    const fee = "0";
    const tokenId = "0x00";
    const { txReceiptL2 } = tokeniseReceipts;

    test("Should fail if client throws a Nightfall error", async () => {
      // Arrange
      mockedClient.tokenise.mockRejectedValue(
        new NightfallSdkError("Oops, client failed at tokenise"),
      );

      // Act, Assert
      expect(
        async () =>
          await createAndSubmitTokenise(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ownerZkpKeys,
            mockedClient,
            l2TokenAddress,
            tokenId,
            value,
            salt,
            fee,
          ),
      ).rejects.toThrow(NightfallSdkError);
      expect(mockedClient.tokenise).toHaveBeenCalledTimes(1);
    });

    test("Should return an instance of <OffChainTransactionReceipts>", async () => {
      // Arrange
      const mockedTokeniseResData = {
        //txDataToSign: unsignedTx,
        transaction: txReceiptL2,
      };
      mockedClient.tokenise.mockResolvedValue(mockedTokeniseResData);
      (submitTransaction as jest.Mock).mockResolvedValue(txReceiptL2);

      // Act
      const txReceipts = await createAndSubmitTokenise(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ownerZkpKeys,
        mockedClient,
        l2TokenAddress,
        tokenId,
        value,
        salt,
        fee,
      );

      // Assert
      expect(mockedClient.tokenise).toHaveBeenCalledWith(
        ownerZkpKeys,
        l2TokenAddress,
        tokenId,
        value,
        salt,
        fee,
      );
      expect(txReceipts).toStrictEqual({ txReceiptL2 });
    });
  });
/*
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
  */
});
