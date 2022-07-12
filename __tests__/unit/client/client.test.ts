import axios from "axios";
import { Client } from "../../../libs/client";

jest.mock("axios");

describe("Client", () => {
  const dummyUrl = "dummy-url";
  const client = new Client(dummyUrl);
  const zkpKeys = {
    compressedZkpPublicKey:
      "0x300adad07dedfff59e930711c8ba5324ac7d22a15ea454ebca7eaba0fae7f9a4",
    nullifierKey:
      "0x1ff0e5c9bb59a8e2c2edbcaf9a19bd17721f74998a8c5b4961db8ac4000cb6c6",
    rootKey:
      "0x14837799d8eb23da87c723f6e4f29b7e80dc0cdda8ab45a8430b133cdd997f25",
    zkpPrivateKey:
      "0xd98adbc9dfc82f3e268cc30de5ca172c2c5d9f0ba677d1914fd5244b211a125",
    zkpPublicKey: [
      "0x28ff35250fe2d316277f150b12c08e965e623871c5cc50020993381f9f54d816",
      "0x300adad07dedfff59e930711c8ba5324ac7d22a15ea454ebca7eaba0fae7f9a4",
    ],
  };

  describe("Constructor", () => {
    test("Should set apiUrl", () => {
      expect(client.apiUrl).toBe(dummyUrl);
    });
  });

  describe("Method healthCheck", () => {
    const url = dummyUrl + "/healthcheck";

    test("Should return true if client app responds with status 200", async () => {
      // Arrange
      const res = { data: "ok", status: 200 };
      (axios.get as jest.Mock).mockResolvedValue(res);

      // Act
      const result = await client.healthCheck();

      // Assert
      expect(axios.get).toHaveBeenCalledWith(url);
      expect(result).toBeTruthy();
    });

    test("Should return false if client app responds with status other than 200", async () => {
      // Arrange
      const res = { data: "ko", status: 201 };
      (axios.get as jest.Mock).mockResolvedValue(res);

      // Act
      const result = await client.healthCheck();

      // Assert
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(result).toBeFalsy();
    });

    test("Should return false if client app responds with status outside the successful range", async () => {
      // Arrange
      (axios.get as jest.Mock).mockRejectedValue(
        new Error("Axios error at healthcheck"),
      );

      // Act
      const result = await client.healthCheck();

      // Assert
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(result).toBeFalsy();
    });
  });

  describe("Method getContractAddress", () => {
    const url = dummyUrl + "/contract-address";
    const contractName = "SHIELD";

    test("Should return Shield contract string if client app responds successfully", async () => {
      // Arrange
      const shieldContractAddress =
        "0xff07Edffc0127E5905Fabc40Ff9718eFfE4C14a1";
      const res = { data: { address: shieldContractAddress } };
      (axios.get as jest.Mock).mockResolvedValue(res);

      // Act
      const result = await client.getContractAddress(contractName);

      // Assert
      expect(axios.get).toHaveBeenCalledWith(`${url}/${contractName}`);
      expect(result).toBe(shieldContractAddress);
    });

    test("Should return null if client app responds with status outside the successful range", async () => {
      // Arrange
      (axios.get as jest.Mock).mockRejectedValue(
        new Error("Axios error at contract-address"),
      );

      // Act
      const result = await client.getContractAddress(contractName);

      // Assert
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe("Method generateZkpKeysFromMnemonic", () => {
    const url = dummyUrl + "/generate-zkp-keys";
    const mnemonic =
      "notable soul hair frost pave now coach what income brush wet make";
    const addressIndex = 0;

    test("Should return a set of Zero-knowledge proof keys if client app responds successfully", async () => {
      // Arrange
      const res = { data: zkpKeys };
      (axios.post as jest.Mock).mockResolvedValue(res);

      // Act
      const result = await client.generateZkpKeysFromMnemonic(
        mnemonic,
        addressIndex,
      );

      // Assert
      expect(axios.post).toHaveBeenCalledWith(url, { mnemonic, addressIndex });
      expect(result).toBe(zkpKeys);
    });

    test("Should return null if client app responds with status outside the successful range", async () => {
      // Arrange
      (axios.post as jest.Mock).mockRejectedValue(
        new Error("Axios error at generate-zkp-keys"),
      );

      // Act
      const result = await client.generateZkpKeysFromMnemonic(
        mnemonic,
        addressIndex,
      );

      // Assert
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe("Method subscribeToIncomingViewingKeys", () => {
    const url = dummyUrl + "/incoming-viewing-key";

    test("Should return string if client app responds successfully", async () => {
      // Arrange
      const msg = "wagmi";
      const res = { data: msg };
      (axios.post as jest.Mock).mockResolvedValue(res);

      // Act
      const result = await client.subscribeToIncomingViewingKeys(zkpKeys);

      // Assert
      expect(axios.post).toHaveBeenCalledWith(url, {
        zkpPrivateKeys: [zkpKeys.zkpPrivateKey],
        nullifierKeys: [zkpKeys.nullifierKey],
      });
      expect(result).toBe(msg);
    });

    test("Should return null if client app responds with status outside the successful range", async () => {
      // Arrange
      (axios.post as jest.Mock).mockRejectedValue(
        new Error("Axios error at incoming-viewing-key"),
      );

      // Act
      const result = await client.subscribeToIncomingViewingKeys(zkpKeys);

      // Assert
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe("Method deposit", () => {
    const url = dummyUrl + "/deposit";
    const token = {
      contractAddress: "0x499d11E0b6eAC7c0593d8Fb292DCBbF815Fb29Ae",
      ercStandard: "ERC20",
    };
    const value = "0.01";
    const fee = 10;

    test("Should return object if client app responds successfully", async () => {
      // Arrange
      const data = {};
      const res = { data };
      (axios.post as jest.Mock).mockResolvedValue(res);

      // Act
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const result = await client.deposit(token, zkpKeys, value, fee);

      // Assert
      expect(axios.post).toHaveBeenCalledWith(url, {
        ercAddress: token.contractAddress,
        tokenType: token.ercStandard,
        tokenId: "0x00", // ISSUE #32 && ISSUE #58
        value,
        compressedZkpPublicKey: zkpKeys.compressedZkpPublicKey,
        nullifierKey: zkpKeys.nullifierKey,
        fee,
      });
      expect(result).toBe(data);
    });

    test("Should return null if client app responds with status outside the successful range", async () => {
      // Arrange
      (axios.post as jest.Mock).mockRejectedValue(
        new Error("Axios error at deposit"),
      );

      // Act
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const result = await client.deposit(token, zkpKeys, value, fee);

      // Assert
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });
});
