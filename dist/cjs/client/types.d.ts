import type { TransactionReceiptL2 } from "../nightfall/types";
export interface TransactionResponseData {
    txDataToSign?: string;
    transaction?: TransactionReceiptL2;
}
