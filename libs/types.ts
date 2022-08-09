import { string } from "joi";

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
  transactionHashCommittedL1: string;
  leafIndex: number;
  root: string;
  siblingPath: CommitmentSibling;
}

interface CommitmentSibling {
  isMember: boolean;
  path: SiblingPath[];
}

interface SiblingPath {
  dir: string;
  value: string;
}

interface Transaction {
  fee: string;
  historicRootBlockNumberL2: string[];
  transactionType: string;
  tokenType: string;
  tokenId: string;
  value: string;
  ercAddress: string;
  recipientAddress: string;
  commitments: string[];
  nullifiers: string[];
  compressedSecrets: string[];
  proof: string[]; //string of hashes
  transactionHash: string;
}

interface TransferReponseData {
  txDataToSign: string;
  transaction: Transaction;
  salts: string[];
}
export { Commitment, Transaction, TransferReponseData, SiblingPath };
