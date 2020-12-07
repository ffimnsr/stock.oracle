import knex from "knex";
import { resolvers as gsResolvers } from "graphql-scalars";
import {
  STOCK_DATA_TABLE,
  STOCK_SECURITY_TYPES_TABLE,
  STOCK_SECTORS_TABLE,
  STOCK_SUBSECTORS_TABLE,
  STOCK_SYMBOLS_TABLE,
  STOCK_JOURNALS_TABLE,
  STOCK_TRADES_TABLE,
  STOCK_TRADE_TRANSACTIONS_TABLE,
  STOCK_WALLETS_TABLE,
  STOCK_WALLET_TRANSACTIONS_TABLE,
} from "./globals";

type Context = {
  db: knex;
};

type AddJournalInput = {
  name: string;
  exchangeId: number;
};

type RenameJournalInput = {
  id: string;
  name: string;
};

type AddTradeTransaction = {
  journalId: string;
  stockId: string;
  action: number;
  grossPrice: number;
  shares: number;
  grossAmount: number;
  fees: number;
  netAmount: number;
  transactionDate: number;
  remarks: string;
};

type AddWalletTransaction = {
  journalId: string;
  transactionDate: number;
  action: number;
  grossAmount: number;
  fees: number;
  netAmount: number;
};

const resolvers = {
  ...gsResolvers,
  JournalStatus: {
    ACTIVE: 1,
    DISABLED: 0,
  },
  TradeType: {
    LONG: 1,
    SHORT: 0,
  },
  TradeStatus: {
    ACTIVE: 1,
    DISABLED: 0,
  },
  TradeAction: {
    BUY: 1,
    SELL: 2,
    STOCKDIVS: 3,
    IPO: 4,
  },
  WalletAction: {
    DEPOSIT: 1,
    WITHDRAWAL: 2,
    CASHDIVS: 3,
  },
  MutationResponse: {
    __resolveType(mutationResponse: any, _context: Context, _info: any) {
      if (mutationResponse.code === "201" && mutationResponse.journal) {
        return "AddJournalMutationReponse";
      }

      if (mutationResponse.code === "202" && mutationResponse.journal) {
        return "RenameJournalMutationResponse";
      }

      if (mutationResponse.tradeTransaction) {
        return "AddTradeTransactionMutationResponse";
      }

      if (mutationResponse.walletTransaction) {
        return "AddWalletTransactionMutationResponse";
      }
      return null;
    },
  },
  Query: {
    ehlo: () => "Hello, World!",
    securityTypes: async (
      _parent: any,
      _args: any,
      { db }: Context,
      _info: any
    ) => {
      const result = await db
        .from(STOCK_SECURITY_TYPES_TABLE)
        .select("id", "code", "name");

      return result;
    },
    sectors: async (_parent: any, _args: any, { db }: Context, _info: any) => {
      const result = await db
        .from(STOCK_SECTORS_TABLE)
        .select("id", "index_id", "name", "code", "is_sectoral");

      return result;
    },
    subsectors: async (
      _parent: any,
      _args: any,
      { db }: Context,
      _info: any
    ) => {
      const result = await db
        .from(STOCK_SUBSECTORS_TABLE)
        .select("id", "index_id", "name", "internal_pse_id");

      return result;
    },
    stocks: async (_parent: any, _args: any, { db }: Context, _info: any) => {
      const result = await db
        .from(STOCK_SYMBOLS_TABLE)
        .select("id", "name", "symbol", "company_id", "security_symbol_id");

      return result;
    },
    stockData: async (
      _parent: any,
      args: any,
      context: Context,
      _info: any
    ) => {
      const { db } = context;
      const result = await db
        .from(STOCK_DATA_TABLE)
        .where({ symbol: args.symbol })
        .orderBy("date", "asc")
        .select("date", "open", "high", "low", "close", "volume");

      return result;
    },
    journals: async (_parent: any, _args: any, { db }: Context, _info: any) => {
      const result = await db
        .from(STOCK_JOURNALS_TABLE)
        .select("id", "name", "exchange_id", "status");

      return result;
    },
    trades: async (_parent: any, args: any, { db }: Context, _info: any) => {
      const result = await db
        .from(STOCK_TRADES_TABLE)
        .where({ journal_id: args.id })
        .select(
          "stock_id",
          "transaction_date_start",
          "transaction_date_end",
          "type",
          "shares",
          "avg_buy_price",
          "buy_amount",
          "avg_sell_price",
          "sell_amount",
          "status"
        );

      return result;
    },
    tradeTransactions: async (
      _parent: any,
      args: any,
      { db }: Context,
      _info: any
    ) => {
      const result = await db
        .from(STOCK_TRADE_TRANSACTIONS_TABLE)
        .where({ journal_id: args.id })
        .select(
          "stock_id",
          "action",
          "gross_price",
          "shares",
          "gross_amount",
          "fees",
          "net_amount",
          "transaction_date",
          "remarks"
        );

      return result;
    },
    wallets: async (_parent: any, _args: any, context: Context, _info: any) => {
      const { db } = context;
      const result = await db.from(STOCK_WALLETS_TABLE).select("balance");

      return result ?? [];
    },
    wallet: async (_parent: any, args: any, { db }: Context, _info: any) => {
      const result = await db
        .from(STOCK_WALLETS_TABLE)
        .where({ journal_id: args.id })
        .select("balance");

      return result;
    },
    walletTransactions: async (
      _parent: any,
      args: any,
      { db }: Context,
      _info: any
    ) => {
      const result = await db
        .from(STOCK_WALLET_TRANSACTIONS_TABLE)
        .where({ journal_id: args.id })
        .select(
          "transaction_date",
          "action",
          "gross_amount",
          "fees",
          "net_amount"
        );

      return result;
    },
  },
  Mutation: {
    addJournal: async (
      _parent: any,
      { input }: { input: AddJournalInput },
      { db }: Context,
      _info: any
    ) => {
      const id = await db.into(STOCK_JOURNALS_TABLE).insert({
        name: input.name,
        exchange_id: input.exchangeId,
      });

      return {
        code: "201",
        success: true,
        message: "Journal was successfully added",
        journal: {
          id: id.toString(),
          name: input.name,
          exchangeId: input.exchangeId,
        },
      };
    },
    renameJournal: async (
      _parent: any,
      { input }: { input: RenameJournalInput },
      { db }: Context,
      _info: any
    ) => {
      const id = await db
        .table(STOCK_JOURNALS_TABLE)
        .where({ id: input.id })
        .update({
          name: input.name,
        });

      return {
        code: "200",
        success: true,
        message: "Journal was successfully updated",
        journal: {
          id: id.toString(),
          name: input.name,
        },
      };
    },
    addTradeTransaction: async (
      _parent: any,
      { input }: { input: AddTradeTransaction },
      { db }: Context,
      _info: any
    ) => {
      const id = await db.into(STOCK_TRADE_TRANSACTIONS_TABLE).insert({
        journal_id: input.journalId,
        stock_id: input.stockId,
        action: input.action,
        gross_price: input.grossPrice,
        shares: input.shares,
        gross_amount: input.grossAmount,
        fees: input.fees,
        net_amount: input.netAmount,
        transaction_date: input.transactionDate,
        remarks: input.remarks,
      });

      return {
        code: "201",
        success: true,
        message: "Trade transaction was successfully added",
        journal: {
          id: id.toString(),
          journalId: input.journalId,
          stockId: input.stockId,
          action: input.action,
          grossPrice: input.grossPrice,
          shares: input.shares,
          grossAmount: input.grossAmount,
          fees: input.fees,
          netAmount: input.netAmount,
          transactionDate: input.transactionDate,
          remarks: input.remarks,
        },
      };
    },
    addWalletTransaction: async (
      _parent: any,
      { input }: { input: AddWalletTransaction },
      { db }: Context,
      _info: any
    ) => {
      const id = await db.into(STOCK_WALLET_TRANSACTIONS_TABLE).insert({
        journal_id: input.journalId,
        transaction_date: input.transactionDate,
        action: input.action,
        gross_amount: input.grossAmount,
        fees: input.fees,
        net_amount: input.netAmount,
      });

      return {
        code: "201",
        success: true,
        message: "Journal was successfully added",
        journal: {
          id: id.toString(),
          journalId: input.journalId,
          transactionDate: input.transactionDate,
          action: input.action,
          grossAmount: input.grossAmount,
          fees: input.fees,
          netAmount: input.netAmount,
        },
      };
    },
  },
};

export default resolvers;
