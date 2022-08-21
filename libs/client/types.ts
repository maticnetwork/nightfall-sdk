import type { TransactionReceiptL2 } from "../nightfall/types";

export interface TransactionResponseData {
  txDataToSign?: string; // only if on-chain
  transaction: TransactionReceiptL2;
}
