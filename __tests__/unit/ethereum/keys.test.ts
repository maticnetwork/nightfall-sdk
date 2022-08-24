import { getEthAccountAddress } from "../../../libs/ethereum";
import { NightfallSdkError } from "../../../libs/utils/error";

describe("Ethereum Keys", () => {
  describe("Get Ethereum address from private key", () => {
    const mockedWeb3 = {
      eth: { accounts: { privateKeyToAccount: jest.fn() } },
    };

    test("Should return an ethereum address when given a valid eth private key", () => {
      // Arrange
      const address = "0x02f979a781260955ee760E92E893938aD1AB8A5E";
      const account = { address };
      mockedWeb3.eth.accounts.privateKeyToAccount.mockReturnValue(account);

      // Act
      const ethPrivateKey =
        "0xc8aecafe1670d0cf314ca53c97332314e867ab9042b7f3f7a64528521111bbaf";
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const result = getEthAccountAddress(ethPrivateKey, mockedWeb3);

      // Assert
      expect(mockedWeb3.eth.accounts.privateKeyToAccount).toHaveBeenCalledWith(
        ethPrivateKey,
      );
      expect(result).toBe(address);
    });

    test("Should return null when given an invalid eth private key", () => {
      // Arrange
      mockedWeb3.eth.accounts.privateKeyToAccount.mockImplementation(() => {
        throw new Error("invalid eth private key");
      });

      // Act, Assert
      const ethPrivateKey = "0xc8aec";
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(() => getEthAccountAddress(ethPrivateKey, mockedWeb3)).toThrow(
        NightfallSdkError,
      );
      expect(mockedWeb3.eth.accounts.privateKeyToAccount).toHaveBeenCalledTimes(
        1,
      );
    });
  });
});
