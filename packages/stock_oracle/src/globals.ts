import dotenv from "dotenv";

dotenv.config();

export const ENVIRONMENT = process.env.NODE_ENV || "production";
export const PORT = process.env.PORT || 80;

export const isProduction = () => {
  return ENVIRONMENT === "production";
}

export const BATCH_INSERT_CHUNK_SIZE = 30;
export const STOCK_DATA_TABLE = isProduction()
  ? "eod_stock_data"
  : "eod_stock_data_test";
export const STOCK_LATEST_DATA_TABLE = "latest_stock_data_by_symbol"
export const STOCK_SYMBOLS_TABLE = "stocks";
export const STOCK_SECURITY_TYPES_TABLE = "security_types";
export const STOCK_SECTORS_TABLE = "sectors";
export const STOCK_SUBSECTORS_TABLE = "subsectors";
export const STOCK_JOURNALS_TABLE = "journals";
export const STOCK_TRADES_TABLE = "trades";
export const STOCK_TRADE_TRANSACTIONS_TABLE = "trade_transactions";
export const STOCK_WALLETS_TABLE = "wallets";
export const STOCK_WALLET_TRANSACTIONS_TABLE = "wallet_transactions";
