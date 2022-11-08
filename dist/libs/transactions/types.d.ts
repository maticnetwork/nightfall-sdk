import type { TransactionReceipt } from "web3-core";
import type { TransactionReceiptL2 } from "../nightfall/types";
export interface RecipientNightfallData {
    recipientCompressedZkpPublicKeys: string[];
    values: string[];
}
export interface OnChainTransactionReceipts {
    txReceipt: TransactionReceipt;
    txReceiptL2: TransactionReceiptL2;
}
export interface OffChainTransactionReceipt {
    txReceiptL2: TransactionReceiptL2;
}
