export type Stock = {
  id: string;
  name: string;
  symbol: string;
  companyId: number;
  securitySymbolId: number;
};

export type StockMinimal = {
  name: string;
  symbol: string;
};

export type StockDataItem = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type LatestStockDataItem = {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};