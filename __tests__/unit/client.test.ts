import axios from "axios";
import { Client } from "../../libs/client";

jest.mock("axios");

describe("Client", () => {
  const dummyUrl = "dummy-url";
  const client = new Client(dummyUrl);
  const zkpKeys = {
    ask: "0x14837799d8eb23da87c723f6e4f29b7e80dc0cdda8ab45a8430b133cdd997f25",
    nsk: "0x225647796f7294cfef66c65bbabaf0b975d8b285fa23c161c25205370ef870b",
    ivk: "0x2d7248800b1b39c0a8163a23ca854f11cfdfa10c369b945d24b2145339212d26",
    pkd: [
      "0x19d3001a494d5a46d7ac4a10e4aef6481728bbc6ba1b0338ff075e038aab55ba",
      "0x2d7beff14d72a14bfb8a3cd1b7c3ed694bf4ecb1eb34e2c538f82ae20e96d18c",
    ],
    compressedPkd:
      "0x2d7beff14d72a14bfb8a3cd1b7c3ed694bf4ecb1eb34e2c538f82ae20e96d18c",
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
      expect(axios.get).toHaveBeenCalled();
      expect(result).toBeFalsy();
    });

    test("Should return false if client app responds with status outside the successful range", async () => {
      // Arrange
      (axios.get as jest.Mock).mockRejectedValue(new Error("Axios error"));

      // Act
      const result = await client.healthCheck();

      // Assert
      expect(axios.get).toHaveBeenCalled();
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
      (axios.get as jest.Mock).mockRejectedValue(new Error("Axios error"));

      // Act
      const result = await client.getContractAddress(contractName);

      // Assert
      expect(axios.get).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("Method generateZkpKeysFromMnemonic", () => {
    const url = dummyUrl + "/generate-keys";
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
      const path = `m/44'/60'/0'/${addressIndex}`;
      expect(axios.post).toHaveBeenCalledWith(url, { mnemonic, path });
      expect(result).toBe(zkpKeys);
    });

    test("Should return null if client app responds with status outside the successful range", async () => {
      // Arrange
      (axios.post as jest.Mock).mockRejectedValue(new Error("Axios error"));

      // Act
      const result = await client.generateZkpKeysFromMnemonic(
        mnemonic,
        addressIndex,
      );

      // Assert
      expect(axios.post).toHaveBeenCalled();
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
        ivks: [zkpKeys.ivk],
        nsks: [zkpKeys.nsk],
      });
      expect(result).toBe(msg);
    });

    test("Should return null if client app responds with status outside the successful range", async () => {
      // Arrange
      (axios.post as jest.Mock).mockRejectedValue(new Error("Axios error"));

      // Act
      const result = await client.subscribeToIncomingViewingKeys(zkpKeys);

      // Assert
      expect(axios.post).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
