import { Web3Websocket } from "../../../libs/ethereum";
import { whichTokenStandard } from "../../../libs/tokens";
import { ERC20, ERC721, ERC1155 } from "../../../libs/tokens/constants";

describe("Which Token Standard", () => {
  const blockchainWsUrl = process.env.APP_BLOCKCHAIN_WEBSOCKET_URL;
  const web3Websocket = new Web3Websocket(blockchainWsUrl);
  const web3 = web3Websocket.web3;

  // Token addresses
  const erc721_address = process.env.APP_TOKEN_ERC721;
  const erc1155_address = process.env.APP_TOKEN_ERC1155;
  const erc20_address = process.env.APP_TOKEN_ERC20;

  afterAll(() => {
    web3Websocket.close();
  });

  test("Should detect standard `ERC721` when passing an ERC721 token address", async () => {
    const ercStandard = await whichTokenStandard(erc721_address, web3);
    expect(ercStandard).toBe(ERC721);
  });

  test("Should detect standard `ERC1155` when passing an ERC1155 token address", async () => {
    const ercStandard = await whichTokenStandard(erc1155_address, web3);
    expect(ercStandard).toBe(ERC1155);
  });

  test("Should detect standard `ERC20` when passing an ERC20 token address", async () => {
    const ercStandard = await whichTokenStandard(erc20_address, web3);
    expect(ercStandard).toBe(ERC20);
  });
});
