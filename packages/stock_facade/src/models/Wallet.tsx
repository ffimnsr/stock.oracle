export enum WalletAction {
  DEPOSIT = 1,
  WITHDRAWAL = 2,
  CASHDIVS = 3,
}

export type Wallet = {
  balance: number;
};

export type WalletTransaction = {
  transactionDate: number;
  action: WalletAction;
  grossAmount: number;
  fees: number;
  netAmount: number;
};
