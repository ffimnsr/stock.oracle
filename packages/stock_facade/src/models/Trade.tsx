export enum TradeType {
  LONG = 1,
  SHORT = 0,
}

export enum TradeStatus {
  ACTIVE = 1,
  DISABLED = 0,
}

export enum TradeAction {
  BUY = 1,
  SELL = 2,
  STOCKDIVS = 3,
  IPO = 4,
}

export type Trade = {
  stockId: string;
  transactionDateStart: number;
  transactionDateEnd: number;
  type: TradeType
  shares: number;
  avgBuyPrice: number;
  buyAmount: number;
  avgSellPrice: number;
  sellAmount: number;
  status: TradeStatus
};

export type TradeTransaction = {
  stockId: string;
  action: TradeAction
  grossPrice: number;
  shares: number;
  grossAmount: number;
  fees: number;
  netAmount: number;
  transactionDate: number;
  remarks: string;
};
