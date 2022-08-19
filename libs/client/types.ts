import type { TransactionReceiptL2 } from "../nightfall/types";

export interface TransferResponseData {
  txDataToSign: string;
  transaction: TransactionReceiptL2;
  salts: string[];
}
