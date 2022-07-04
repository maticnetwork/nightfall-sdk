import axios from "axios";
import { Client } from "../../libs/client";

jest.mock("axios");

describe("Client", () => {
  const dummyUrl = "dummy-url";
  const client = new Client(dummyUrl);

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

    test("Should return Shield contract address if client app responds successfully", async () => {
      // Arrange
      const shieldContractAddress =
        "0xff07Edffc0127E5905Fabc40Ff9718eFfE4C14a1";
      const res = { data: { address: shieldContractAddress } };
      (axios.get as jest.Mock).mockResolvedValue(res);

      // Act
      const contractName = "SHIELD";
      const result = await client.getContractAddress(contractName);

      // Assert
      expect(axios.get).toHaveBeenCalledWith(`${url}/${contractName}`);
      expect(result).toBe(shieldContractAddress);
    });

    test("Should return null if client app responds with status outside the successful range", async () => {
      // Arrange
      (axios.get as jest.Mock).mockRejectedValue(new Error("Axios error"));

      // Act
      const contractName = "SHIELD";
      const result = await client.getContractAddress(contractName);

      // Assert
      expect(axios.get).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
