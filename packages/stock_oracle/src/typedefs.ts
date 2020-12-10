import { gql } from "apollo-server-express";
import { typeDefs as gsTypeDefs } from "graphql-scalars";

export const localTypeDefs = gql`
  type Sector {
    id: ID!
    indexId: String
    name: String
    code: String
    isSectoral: Boolean
  }

  type Subsector {
    id: ID!
    indexId: String
    name: String
    internalPseId: Int
  }

  type SecurityType {
    id: ID!
    code: String
    name: String
  }

  type Stock {
    id: ID!
    name: String
    symbol: String
    companyId: Int
    securitySymbolId: Int
  }

  type StockDataItem {
    date: Float
    open: Float
    high: Float
    low: Float
    close: Float
    volume: Float
  }

  enum JournalStatus {
    ACTIVE
    DISABLED
  }

  type Journal {
    id: ID!
    name: String
    exchangeId: Int
    status: JournalStatus
  }

  enum TradeType {
    LONG
    SHORT
  }

  enum TradeStatus {
    ACTIVE
    DISABLED
  }

  enum TradeAction {
    BUY
    SELL
    STOCKDIVS
    IPO
  }

  type Trade {
    id: ID!
    stockId: ID!
    transactionDateStart: Float
    transactionDateEnd: Float
    type: TradeType!
    shares: Float
    buyShares: Float
    avgBuyPrice: Float
    sellShares: Float
    avgSellPrice: Float
    status: TradeStatus
  }

  type TradeTransaction {
    id: ID!
    stockId: ID!
    tradeId: ID!
    action: TradeAction!
    grossPrice: Float
    shares: Float
    grossAmount: Float
    fees: Float
    netAmount: Float
    transactionDate: Float
    remarks: String
  }

  enum WalletAction {
    DEPOSIT
    WITHDRAWAL
    CASHDIVS
  }

  type Wallet {
    id: ID!
    balance: Float
  }

  type WalletTransaction {
    id: ID!
    walletId: ID!
    transactionDate: Float
    action: WalletAction!
    grossAmount: Float
    fees: Float
    netAmount: Float
  }

  type Query {
    ehlo: String!
    securityTypes: [SecurityType!]
    sectors: [Sector!]
    subsectors: [Subsector!]
    stocks: [Stock!]
    stockData(symbol: String!): [StockDataItem]
    journals: [Journal]
    trades(id: ID!): [Trade]
    activeTrades(id: ID!): [Trade]
    closedTrades(id: ID!): [Trade]
    tradeTransactions(id: ID!): [TradeTransaction]
    wallets: [Wallet]
    wallet(id: ID!): Wallet
    walletTransactions(id: ID!): [WalletTransaction]
  }

  input AddJournalInput {
    name: String!
    exchangeId: Int!
  }

  input RenameJournalInput {
    id: ID!
    name: String!
  }

  input AddTradeTransaction {
    journalId: ID!
    stockId: ID!
    action: TradeAction!
    grossPrice: Float!
    shares: Float!
    grossAmount: Float!
    fees: Float!
    netAmount: Float!
    transactionDate: Float!
    remarks: String
  }

  input AddWalletTransaction {
    journalId: ID!
    walletId: ID!
    transactionDate: Float!
    action: WalletAction!
    grossAmount: Float!
    fees: Float!
    netAmount: Float!
  }

  interface MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }

  type AddJournalMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    journal: Journal
  }

  type RenameJournalMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    journal: Journal
  }

  type AddTradeTransactionMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    transaction: TradeTransaction
  }

  type AddWalletTransactionMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    transaction: WalletTransaction
  }

  type Mutation {
    addJournal(input: AddJournalInput!): AddJournalMutationResponse
    renameJournal(input: RenameJournalInput!): RenameJournalMutationResponse
    addTradeTransaction(
      input: AddTradeTransaction!
    ): AddTradeTransactionMutationResponse
    addWalletTransaction(
      input: AddWalletTransaction!
    ): AddWalletTransactionMutationResponse
  }
`;

const typeDefs = [...gsTypeDefs.map((x) => gql(x)), localTypeDefs];

export default typeDefs;
