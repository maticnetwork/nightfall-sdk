import { TokenFactory, whichTokenStandard } from "../../../libs/tokens";
import { stringValueToWei } from "../../../libs/transactions/helpers/stringValueToWei";
import { prepareTokenValueTokenId } from "../../../libs/transactions/helpers/prepareTokenValueTokenId";
import { ERC20, ERC721, ERC1155 } from "../../../libs/tokens/constants";
import type Web3 from "web3";
import {
  TX_VALUE_DEFAULT,
  TX_TOKEN_ID_DEFAULT,
} from "../../../libs/user/constants";

jest.mock("../../../libs/tokens", () => {
  const originalModule = jest.requireActual("../../../libs/tokens");
  const mockedWhichTokenStandard = jest.fn();
  const mockedTokenFactory = { create: jest.fn() };

  return {
    __esModule: true,
    ...originalModule,
    whichTokenStandard: mockedWhichTokenStandard,
    TokenFactory: mockedTokenFactory,
  };
});

jest.mock("../../../libs/transactions/helpers/stringValueToWei", () => {
  const originalModule = jest.requireActual(
    "../../../libs/transactions/helpers/stringValueToWei",
  );
  const mockedStringValueToWei = jest.fn();

  return {
    __esModule: true,
    ...originalModule,
    stringValueToWei: mockedStringValueToWei,
  };
});

describe("Prepare Token Value TokenId", () => {
  const mockedWeb3 = {} as Web3;
  const contractAddress = "0xContractAddress";
  const value = "100";
  let tokenId = "0xTokenId721";

  test("Should return token, value default and given tokenId for an ERC721", async () => {
    // Arrange
    const token = {
      contractAddress,
      ercStandard: ERC721,
      decimals: 0,
    };
    (whichTokenStandard as jest.Mock).mockResolvedValue(ERC721);
    (TokenFactory.create as jest.Mock).mockResolvedValue(token);

    // Act
    const result = await prepareTokenValueTokenId(
      contractAddress,
      value,
      tokenId,
      mockedWeb3,
    );

    // Assert
    expect(whichTokenStandard).toHaveBeenCalledWith(
      contractAddress,
      mockedWeb3,
    );
    expect(TokenFactory.create).toHaveBeenCalledWith({
      contractAddress,
      ercStandard: ERC721,
      web3: mockedWeb3,
    });
    expect(stringValueToWei).not.toHaveBeenCalled();

    expect(result.token).toBe(token);
    expect(result.valueWei).toBe(TX_VALUE_DEFAULT);
    expect(result.tokenId).toBe(tokenId);
  });
  test("Should return token, given value in Wei and given tokenId for an ERC1155", async () => {
    // Arrange
    tokenId = "4";
    const token = {
      contractAddress,
      ercStandard: ERC1155,
      decimals: 0,
    };
    (whichTokenStandard as jest.Mock).mockResolvedValue(ERC1155);
    (TokenFactory.create as jest.Mock).mockResolvedValue(token);
    (stringValueToWei as jest.Mock).mockReturnValue(value);

    // Act
    const result = await prepareTokenValueTokenId(
      contractAddress,
      value,
      tokenId,
      mockedWeb3,
    );

    // Assert
    expect(whichTokenStandard).toHaveBeenCalledWith(
      contractAddress,
      mockedWeb3,
    );
    expect(TokenFactory.create).toHaveBeenCalledWith({
      contractAddress,
      ercStandard: ERC1155,
      web3: mockedWeb3,
    });
    expect(stringValueToWei).toHaveBeenCalledWith(value, token.decimals);

    expect(result.token).toBe(token);
    expect(result.valueWei).toBe(value);
    expect(result.tokenId).toBe(tokenId);
  });
  test("Should return token, given value in Wei and tokenId default for an ERC20", async () => {
    // Arrange
    const decimals = "0000000";
    const valueWei = value + decimals;
    const token = {
      contractAddress,
      ercStandard: ERC20,
      decimals: decimals.length,
    };
    (whichTokenStandard as jest.Mock).mockResolvedValue(ERC20);
    (TokenFactory.create as jest.Mock).mockResolvedValue(token);
    (stringValueToWei as jest.Mock).mockReturnValue(valueWei);

    // Act
    const result = await prepareTokenValueTokenId(
      contractAddress,
      value,
      tokenId,
      mockedWeb3,
    );

    // Assert
    expect(whichTokenStandard).toHaveBeenCalledWith(
      contractAddress,
      mockedWeb3,
    );
    expect(TokenFactory.create).toHaveBeenCalledWith({
      contractAddress,
      ercStandard: ERC20,
      web3: mockedWeb3,
    });
    expect(stringValueToWei).toHaveBeenCalledWith(value, token.decimals);

    expect(result.token).toBe(token);
    expect(result.valueWei).toBe(valueWei);
    expect(result.tokenId).toBe(TX_TOKEN_ID_DEFAULT);
  });
});
