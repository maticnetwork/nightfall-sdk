import type Web3 from "web3";
import { estimateGas } from "../../../libs/ethereum";
import {
  TX_GAS_DEFAULT,
  TX_GAS_MULTIPLIER,
} from "../../../libs/ethereum/constants";

describe("Estimate gas", () => {
  const tx = {
    from: "0xfrom9bF4A217A57A84dfbbA633E008F05378D47d",
    to: "0xto508a9e024CaCa25f139C6490c0dea49eF37795",
    value: "10",
    data: "0xdcc7bceb000000000000000..00499d11e0b6eac",
  };
  const mockedWeb3 = {
    eth: { estimateGas: jest.fn() },
  };

  test("Should return default * multiplier if web3 call fails", async () => {
    // Arrange
    mockedWeb3.eth.estimateGas.mockRejectedValue(
      new Error("Oops! Web3 failed"),
    );

    // Act
    const gas = await estimateGas(tx, mockedWeb3 as undefined as Web3);

    // Assert
    expect(mockedWeb3.eth.estimateGas).toHaveBeenCalledTimes(1);
    expect(gas).toBe(Math.ceil(TX_GAS_DEFAULT * TX_GAS_MULTIPLIER));
  });

  test("Should return gas * multiplier", async () => {
    // Arrange
    const MOCKED_GAS = 100467;
    mockedWeb3.eth.estimateGas.mockResolvedValue(MOCKED_GAS);

    // Act
    const gas = await estimateGas(tx, mockedWeb3 as undefined as Web3);

    // Assert
    expect(mockedWeb3.eth.estimateGas).toHaveBeenCalledWith(tx);
    expect(gas).toBe(Math.ceil(MOCKED_GAS * TX_GAS_MULTIPLIER));
  });
});
