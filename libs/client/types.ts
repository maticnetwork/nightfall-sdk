import type { TransactionReceiptL2 } from "../nightfall/types";

interface TransactionResponseData {
  txDataToSign: string;
  transaction: TransactionReceiptL2;
}

export type DepositResponseData = TransactionResponseData;

export interface TransferResponseData extends TransactionResponseData {
  salts: string[];
}
