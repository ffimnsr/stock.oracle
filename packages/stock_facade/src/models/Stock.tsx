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