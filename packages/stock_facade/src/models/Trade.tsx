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
  id: string;
  stockId: string;
  transactionDateStart: number;
  transactionDateEnd: number | null;
  type: TradeType
  shares: number;
  buyShares: number;
  avgBuyPrice: number;
  sellShares: number;
  avgSellPrice: number;
  status: TradeStatus
};

export type TradeTransaction = {
  id: string;
  stockId: string;
  tradeId: string;
  action: TradeAction
  grossPrice: number;
  shares: number;
  grossAmount: number;
  fees: number;
  netAmount: number;
  transactionDate: number;
  remarks: string;
};
