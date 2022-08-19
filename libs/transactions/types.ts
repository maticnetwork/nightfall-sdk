import type { TransactionReceipt } from "web3-core";
import type { TransactionReceiptL2 } from "../nightfall/types";

export interface NightfallRecipientData {
  recipientCompressedZkpPublicKeys: string[];
  values: string[];
}

export interface TransactionReceipts {
  txReceipt: TransactionReceipt;
  txReceiptL2: TransactionReceiptL2;
}
