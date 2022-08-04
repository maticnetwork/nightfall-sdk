interface Commitment {
  _id: string;
  compressedZkpPublicKey: string;
  preimage: {
    ercAddress: string;
    tokenId: string;
    value: string;
    zkpPublicKey: string[];
    salt: string;
  };
  isDeposited: boolean;
  isOnChain: number;
  isPendingNullification: boolean;
  isNullified: boolean;
  isNullifiedOnChain: number;
  nullifier: string;
  blockNumber: number;
}

export default Commitment;
