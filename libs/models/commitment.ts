type ICommitments = {
  _id: string;
  preimage: {
    ercAddress: string;
    tokenId: string;
    value: string;
    zkpPublicKey: string[];
    compressedZkpPublicKey: string;
    salt: string;
  };
  isDeposited: boolean;
  isOnChain: number;
  isPendingNullification: boolean;
  isNullified: boolean;
  isNullifiedOnChain: number;
  nullifier: string;
  blockNumber: number;
};

export default ICommitments;
