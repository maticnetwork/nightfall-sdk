import { NetworkConfig } from "../types/types";

const networks: { [key: string]: NetworkConfig } = {
  GANACHE: {
    tokens: {
      ERC20MOCK: {
        contractAbi: "ERC20.json",
        contractAddress: "0xf05e9FB485502E5A93990C714560b7cE654173c3",
      },
    },
  },
  GOERLI: {
    tokens: {
      MATIC: {
        contractAbi: "ERC20.json",
        contractAddress: "0x499d11E0b6eAC7c0593d8Fb292DCBbF815Fb29Ae",
      },
    },
  },
};

export default networks;
