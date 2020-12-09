import knex from "knex";
import log from "loglevel";
import { resolvers as gsResolvers } from "graphql-scalars";
import moment from "moment";
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

enum JournalStatus {
  ACTIVE = 1,
  DISABLED = 0,
}

enum TradeType {
  LONG = 1,
  SHORT = 0,
}

enum TradeStatus {
  ACTIVE = 1,
  DISABLED = 0,
}

enum TradeAction {
  BUY = 1,
  SELL = 2,
  STOCKDIVS = 3,
  IPO = 4,
}

enum WalletAction {
  DEPOSIT = 1,
  WITHDRAWAL = 2,
  CASHDIVS = 3,
}
``;

const resolvers = {
  ...gsResolvers,
  JournalStatus: {
    ACTIVE: JournalStatus.ACTIVE,
    DISABLED: JournalStatus.DISABLED,
  },
  TradeType: {
    LONG: TradeType.LONG,
    SHORT: TradeType.SHORT,
  },
  TradeStatus: {
    ACTIVE: TradeStatus.ACTIVE,
    DISABLED: TradeStatus.DISABLED,
  },
  TradeAction: {
    BUY: TradeAction.BUY,
    SELL: TradeAction.SELL,
    STOCKDIVS: TradeAction.STOCKDIVS,
    IPO: TradeAction.IPO,
  },
  WalletAction: {
    DEPOSIT: WalletAction.DEPOSIT,
    WITHDRAWAL: WalletAction.WITHDRAWAL,
    CASHDIVS: WalletAction.CASHDIVS,
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
          "buy_shares",
          "avg_buy_price",
          "sell_shares",
          "avg_sell_price",
          "status"
        );

      return result;
    },
    activeTrades: async (_parent: any, args: any, { db }: Context, _info: any) => {
      const result = await db
        .from(STOCK_TRADES_TABLE)
        .where({ journal_id: args.id })
        .andWhere({ status: TradeStatus.ACTIVE })
        .select(
          "stock_id",
          "transaction_date_start",
          "transaction_date_end",
          "type",
          "shares",
          "buy_shares",
          "avg_buy_price",
          "sell_shares",
          "avg_sell_price",
          "status"
        );

      return result;
    },
    closedTrades: async (_parent: any, args: any, { db }: Context, _info: any) => {
      const result = await db
        .from(STOCK_TRADES_TABLE)
        .where({ journal_id: args.id })
        .andWhere({ status: TradeStatus.DISABLED })
        .select(
          "stock_id",
          "transaction_date_start",
          "transaction_date_end",
          "type",
          "shares",
          "buy_shares",
          "avg_buy_price",
          "sell_shares",
          "avg_sell_price",
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
          "trade_id",
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
          id: id[0].toString(),
          name: input.name,
          exchange_id: input.exchangeId,
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
      const activeTrades = await db
        .from(STOCK_TRADES_TABLE)
        .where({ journal_id: input.journalId })
        .andWhere({ stock_id: input.stockId })
        .andWhere({ status: TradeStatus.ACTIVE })
        .andWhere({ is_deleted: false })
        .select(
          "id",
          "shares",
          "buy_shares",
          "avg_buy_price",
          "sell_shares",
          "avg_sell_price",
          "status"
        );

      // Parse first transaction date.
      const transactionDateParsed = moment(input.transactionDate).toDate();

      // If there are no match, create one otherwise
      // use first match as trade id; also update the
      // trade data if its existing.
      let tradeId = 0;
      if (activeTrades.length > 0) {
        // Only get first trade.
        const currentTrade = activeTrades[0];
        tradeId = currentTrade.id;

        log.trace(currentTrade);
        if (input.action === TradeAction.BUY) {
          const previousAvgBuyPrice = currentTrade.avg_buy_price;
          const currentAvgBuyPrice = input.netAmount / input.shares;
          const totalAvgBuyPrice = previousAvgBuyPrice
            ? (previousAvgBuyPrice + currentAvgBuyPrice) / 2
            : currentAvgBuyPrice;
          const totalBuyShares = currentTrade.buy_shares + input.shares;
          const totalActiveShares = currentTrade.shares + input.shares;

          log.trace(
            previousAvgBuyPrice,
            currentAvgBuyPrice,
            totalAvgBuyPrice,
            totalBuyShares,
            totalActiveShares
          );

          await db.table(STOCK_TRADES_TABLE).where({ id: tradeId }).update({
            shares: totalActiveShares,
            buy_shares: totalBuyShares,
            avg_buy_price: totalAvgBuyPrice,
          });
        } else if (input.action === TradeAction.SELL) {
          const previousAvgSellPrice = currentTrade.avg_sell_price;
          const currentAvgSellPrice = input.netAmount / input.shares;
          const totalAvgSellPrice = previousAvgSellPrice
            ? (previousAvgSellPrice + currentAvgSellPrice) / 2
            : currentAvgSellPrice;
          const totalSellShares = currentTrade.sell_shares + input.shares;
          const totalActiveShares = currentTrade.shares - input.shares;

          if (totalActiveShares <= 0) {
            await db.table(STOCK_TRADES_TABLE).where({ id: tradeId }).update({
              transaction_date_end: moment().toDate(),
              shares: totalActiveShares,
              sell_shares: totalSellShares,
              avg_sell_price: totalAvgSellPrice,
              status: TradeStatus.DISABLED,
            });
          }

          log.trace(
            previousAvgSellPrice,
            currentAvgSellPrice,
            totalAvgSellPrice,
            totalSellShares,
            totalActiveShares
          );

          await db.table(STOCK_TRADES_TABLE).where({ id: tradeId }).update({
            shares: totalActiveShares,
            sell_shares: totalSellShares,
            avg_sell_price: totalAvgSellPrice,
          });
        } else {
          // Redirect to error if unknown trade action.
          tradeId = 0;
        }
      } else {
        // Only accept if action is `BUY` as if it was negative
        // it will only cause negative value.
        if (input.action === TradeAction.BUY) {
          const initialAvgBuyPrice = input.netAmount / input.shares;

          const temp = await db.into(STOCK_TRADES_TABLE).insert({
            journal_id: input.journalId,
            stock_id: input.stockId,
            transaction_date_start: transactionDateParsed,
            type: TradeType.LONG,
            shares: input.shares,
            buy_shares: input.shares,
            avg_buy_price: initialAvgBuyPrice,
            status: TradeStatus.ACTIVE,
          });

          tradeId = temp[0];
        }
      }

      if (tradeId === 0) {
        return {
          code: "400",
          success: false,
          message: "Unable to create trade transaction as trade is empty",
        };
      }

      const id = await db.into(STOCK_TRADE_TRANSACTIONS_TABLE).insert({
        journal_id: input.journalId,
        stock_id: input.stockId,
        trade_id: tradeId,
        action: input.action,
        gross_price: input.grossPrice,
        shares: input.shares,
        gross_amount: input.grossAmount,
        fees: input.fees,
        net_amount: input.netAmount,
        transaction_date: transactionDateParsed,
        remarks: input.remarks,
      });

      log.trace(id);
      return {
        code: "201",
        success: true,
        message: "Trade transaction was successfully added",
        transaction: {
          stock_id: input.stockId,
          trade_id: tradeId,
          action: input.action,
          gross_price: input.grossPrice,
          shares: input.shares,
          gross_amount: input.grossAmount,
          fees: input.fees,
          net_amount: input.netAmount,
          transaction_date: transactionDateParsed,
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
      const activeWallets = await db
        .from(STOCK_WALLETS_TABLE)
        .where({ journal_id: input.journalId })
        .andWhere({ is_deleted: false })
        .select("id", "balance");

      // Parse first transaction date.
      const transactionDateParsed = moment(input.transactionDate).toDate();

      // If there are no match, create one otherwise
      // use first match as wallet id; also update the
      // wallet data if its existing.
      let walletId = 0;
      if (activeWallets.length > 0) {
        const currentWallet = activeWallets[0];
        walletId = currentWallet.id;

        log.trace(currentWallet);
        if (
          input.action === WalletAction.DEPOSIT ||
          input.action === WalletAction.CASHDIVS
        ) {
          const previousBalance = currentWallet.balance;
          const totalWalletBalance = previousBalance + input.netAmount;
          await db
            .table(STOCK_WALLETS_TABLE)
            .where({
              id: walletId,
            })
            .update({
              balance: totalWalletBalance,
            });
        } else if (input.action === WalletAction.WITHDRAWAL) {
          const previousBalance = currentWallet.balance;
          const totalWalletBalance = previousBalance - input.netAmount;

          if (totalWalletBalance < 0) {
            return {
              code: "400",
              success: false,
              message: "Unable to withdraw amount from wallet as balance is not enough",
            };
          }

          await db
            .table(STOCK_WALLETS_TABLE)
            .where({
              id: walletId,
            })
            .update({
              balance: totalWalletBalance,
            });
        } else {
          // Redirect to error if unknown wallet action.
          walletId = 0;
        }
      } else {
        // Only accept on first wallet creation deposit.
        if (input.action === WalletAction.DEPOSIT) {
          const temp = await db.into(STOCK_WALLETS_TABLE).insert({
            journal_id: input.journalId,
            balance: input.netAmount,
          });

          walletId = temp[0];
        }
      }

      if (walletId === 0) {
        return {
          code: "400",
          success: false,
          message: "Unable to create wallet transaction as wallet is empty",
        };
      }

      const id = await db.into(STOCK_WALLET_TRANSACTIONS_TABLE).insert({
        journal_id: input.journalId,
        wallet_id: walletId,
        transaction_date: transactionDateParsed,
        action: input.action,
        gross_amount: input.grossAmount,
        fees: input.fees,
        net_amount: input.netAmount,
      });

      log.trace(id);
      return {
        code: "201",
        success: true,
        message: "Journal was successfully added",
        walletTransaction: {
          wallet_id: walletId,
          transaction_date: transactionDateParsed,
          action: input.action,
          gross_amount: input.grossAmount,
          fees: input.fees,
          net_amount: input.netAmount,
        },
      };
    },
  },
};

export default resolvers;
