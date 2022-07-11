import { Token } from "../../../libs/tokens";

describe("Token", () => {
  const DECIMALS = 18;
  const call = jest.fn();
  const encodeABI = jest.fn();
  class MockedContract {
    methods = {
      decimals: () => call.mockReturnValueOnce(DECIMALS),
      allowance: () => call.mockReturnValueOnce(777),
      approve: (c: unknown, d: unknown) => encodeABI.mockReturnValueOnce(true),
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor(a: unknown, b: unknown) {}
  }
  const mockedWeb3 = {
    eth: { Contract: MockedContract },
  };
  const address = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
  const ercStandard = "ERC20";

  const token = new Token({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    web3: mockedWeb3,
    address,
    ercStandard,
  });

  describe("Constructor", () => {
    test("Should set contractAddress", () => {
      expect(token.contractAddress).toBe(address);
    });

    test("Should set ercStandard", () => {
      expect(token.ercStandard).toBe(ercStandard);
    });

    test("Should set contract", () => {
      expect(token.contract).toBeInstanceOf(MockedContract);
    });
  });

  describe("Set token decimals", () => {
    test("Should set token decimals from contract", async () => {
      await token.setTokenDecimals();
      expect(token.decimals).toBe(DECIMALS);
    });
  });
});
