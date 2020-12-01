import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import compression from "compression";
import responseTime from "response-time";
import basicAuth from "express-basic-auth";
import log from "loglevel";
import dotenv from "dotenv";
import { ApolloServer, gql } from "apollo-server-express";
import knex from "knex";
import axios from "axios";
import moment from "moment";

dotenv.config();

const ENVIRONMENT = process.env.NODE_ENV || "production";
const PORT = process.env.PORT || 80;

const BATCH_INSERT_CHUNK_SIZE = 30;
const STOCK_DATA_TABLE = "eod_stock_data_test";
const STOCK_SYMBOLS_TABLE = "stock_symbols";
const STOCK_SECURITY_TYPES_TABLE = "security_types";
const STOCK_SECTORS_TABLE = "sectors";
const STOCK_SUBSECTORS_TABLE = "subsectors";

log.setLevel(ENVIRONMENT === "production" ? log.levels.INFO : log.levels.DEBUG);

const client = knex({
  client: "mysql",
  connection: {
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  pool: { min: 0, max: 9 },
});

const typeDefs = gql`
  type StockSymbol {
    id: ID
    symbol: String
    name: String
    status: Int
    listedDate: String
    sectorId: Int
    subsectorId: Int
    createdAt: String
    updatedAt: String
  }

  type StockDataItem {
    id: ID
    date: String
    open: Float
    high: Float
    low: Float
    close: Float
    Volume: Float
    symbol: String
  }

  type Query {
    hello: String
    symbols: [StockSymbol]
    stockData: [StockDataItem]
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello, World!",
    symbols: () => {},
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});
const app = express();

app.set("dao", client);
app.use(
  basicAuth({
    users: { oracle_admin: "oracle_pass" },
    challenge: true,
    realm: "The Oracle",
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));
app.use(compression());
app.use(responseTime());

server.applyMiddleware({ app });

app.get("/", (_req: Request, res: Response) => {
  res.send("Stock Oracle");
});

app.post("/management/fill_security_types", async (req: Request, res: Response) => {
  try {
    const db = req.app.get("dao") as knex;
    const securityTypesRaw = await getSecurityTypes();
    const securityTypes = securityTypesRaw.map((securityType: any) => ({
      "code": securityType.code,
      "name": securityType.name,
    }));

    await db.batchInsert(STOCK_SECURITY_TYPES_TABLE, securityTypes, BATCH_INSERT_CHUNK_SIZE);

    res.json({
      success: true,
      message: "Successfully filled security types to database.",
    });    
  } catch (e) {
    log.error(e.message);
    res.status(400).json({
      success: false,
      message: "Unable to fill security types: " + e.message,
    });
  }
});

app.post("/management/fill_sectors", async (req: Request, res: Response) => {
  try {
    const db = req.app.get("dao") as knex;
    const sectorsRaw = await getSectors();
    const sectors = sectorsRaw.map((sector: any) => ({
      "index_id": sector.indexId,
      "code": sector.indexAbb,
      "name": sector.indexName,
      "is_sectoral": sector.isSectoral === "Y" ? 1 : 0,
    }));

    await db.batchInsert(STOCK_SECTORS_TABLE, sectors, BATCH_INSERT_CHUNK_SIZE);

    res.json({
      success: true,
      message: "Successfully filled sectors to database.",
    });    
  } catch (e) {
    log.error(e.message);
    res.status(400).json({
      success: false,
      message: "Unable to fill sectors: " + e.message,
    });
  }
});

app.post("/management/fill_subsectors", async (req: Request, res: Response) => {
  try {
    const db = req.app.get("dao") as knex;
    const sectorsRaw = await getSubsectors();
    const sectors = sectorsRaw.map((sector: any) => ({
      "index_id": sector.indexId,
      "name": sector.subsectorName,
      "internal_pse_id": sector.subsectorID,
    }));

    await db.batchInsert(STOCK_SUBSECTORS_TABLE, sectors, BATCH_INSERT_CHUNK_SIZE);

    res.json({
      success: true,
      message: "Successfully filled subsectors to database.",
    });    
  } catch (e) {
    log.error(e.message);
    res.status(400).json({
      success: false,
      message: "Unable to fill subsectors: " + e.message,
    });
  }
});

app.post("/management/fill_listed_companies", async (req: Request, res: Response) => {
  try {
    const db = req.app.get("dao") as knex;
    const listedCompaniesRaw = await getListedCompanies();
    const listedCompanies = listedCompaniesRaw.map((company: any) => ({
      "symbol": company.securitySymbol,
      "name": company.securityName,
      "status": 1,
      "listed_date": moment(company.listingDate).toDate(),
      "security_status": company.securityStatus,
      "security_type": company.securityType,
      "subsector_id": company.subsectorName,
      "sector_id": company.indexName,
      "company_id": company.companyId,
      "security_symbol_id": company.securitySymbolId,
    }));

    await db.batchInsert(STOCK_SYMBOLS_TABLE, listedCompanies, BATCH_INSERT_CHUNK_SIZE);

    res.json({
      success: true,
      message: "Successfully filled listed companies to database.",
    });    
  } catch (e) {
    log.error(e.message);
    res.status(400).json({
      success: false,
      message: "Unable to fill listed companies: " + e.message,
    });
  }
});

app.get("/get_stock_security_id/:symbol", async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const securityId = await getSecurityId(symbol);

    res.json({
      success: true,
      message: `Successfully fetch security id: ${securityId}`,
    });
  } catch (e) {
    log.error(e.message);
    res.status(400).json({
      success: false,
      message: "Unable to archive data: " + e.message,
    });
  }
});

app.post("/archive_last_trading_stock_data", async (req: Request, res: Response) => {
  try {
    const db = req.app.get("dao") as knex;
    const symbols = await db
      .from(STOCK_SYMBOLS_TABLE)
      .select("symbol", "company_id", "security_symbol_id");

    var comprehensiveStockData: any[] = [];
    for (var i = 0; i < symbols.length; i++) {
      var { symbol, security_symbol_id } = symbols[i];
      const data = await getEodData(security_symbol_id);
      log.trace(symbol, security_symbol_id);

      if (data === null) {
        continue;
      }

      comprehensiveStockData.push({
        "date": moment(data.tradingDate).toDate(),
        "open": data.sqOpen,
        "high": data.sqHigh,
        "low": data.sqLow,
        "close": data.sqClose,
        "volume": data.totalVolume,
        "symbol": symbol,
      });
    }

    if (comprehensiveStockData.length > 0) {
      await db.batchInsert(STOCK_DATA_TABLE, comprehensiveStockData, 30);  
    }

    res.json({
      success: true,
      message: "Successfully stored daily data to database.",
    });
  } catch (e) {
    log.error(e.message);
    res.status(400).json({
      success: false,
      message: "Unable to archive data: " + e.message,
    });
  }
});

app.post("/archive_trading_stock_data/:slicesRaw", async (req: Request, res: Response) => {
  try {
    const { slicesRaw } = req.params;
    const slices = parseInt(slicesRaw);

    if (slices <= 0) {
      throw "slice number not enought";
    }

    const db = req.app.get("dao") as knex;
    const symbols = await db
      .from(STOCK_SYMBOLS_TABLE)
      .select("symbol", "company_id", "security_symbol_id");

    var comprehensiveStockData: any[] = [];
    for (var i = 0; i < symbols.length; i++) {
      var { symbol, security_symbol_id } = symbols[i];
      const dataRaw = await getEodDataSlice(security_symbol_id, slices);
      log.trace(symbol, security_symbol_id);

      if (dataRaw === null) {
        continue;
      }

      const stockData = dataRaw.map((data: any) => ({
        "date": moment(data.tradingDate).toDate(),
        "open": data.sqOpen,
        "high": data.sqHigh,
        "low": data.sqLow,
        "close": data.sqClose,
        "volume": data.totalVolume,
        "symbol": symbol,
      }));

      comprehensiveStockData.push(stockData);
    }

    const flatStockData = comprehensiveStockData.flat();
    if (flatStockData.length > 0) {
      await db.batchInsert(STOCK_DATA_TABLE, flatStockData, 30);  
    }

    res.json({
      success: true,
      message: "Successfully stored daily data to database.",
    });
  } catch (e) {
    log.error(e.message);
    res.status(400).json({
      success: false,
      message: "Unable to archive data: " + e.message,
    });
  }
});

app.listen({ port: PORT }, function () {
  log.info(`Server now listening in port ${PORT}`);
});

async function getListedCompanies(): Promise<any> {
  const response = await axios.get("companyInfoSecurityProfile.html?method=getListedRecords&common=yes&ajax=true", {
    baseURL: "https://www.pse.com.ph/stockMarket/",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "X-Requested-With": "XMLHttpRequest",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Referer": "https://www.pse.com.ph/stockMarket/home.html",
    },
  });

  const { data } = response;
  if (data.records.length === 0 || data.records === null) {
    return null;
  }

  return data.records as any;
}

async function getSecurityTypes(): Promise<any> {
  const response = await axios.get("companyInfoSecurityProfile.html?method=getSecurityTypes&ajax=true", {
    baseURL: "https://www.pse.com.ph/stockMarket/",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "X-Requested-With": "XMLHttpRequest",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Referer": "https://www.pse.com.ph/stockMarket/home.html",
    },
  });

  const { data } = response;
  if (data.records.length === 0 || data.records === null) {
    return null;
  }

  return data.records as any;
}

async function getSectors(): Promise<any> {
  const response = await axios.get("companyInfoSecurityProfile.html?method=getSectors&ajax=true", {
    baseURL: "https://www.pse.com.ph/stockMarket/",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "X-Requested-With": "XMLHttpRequest",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Referer": "https://www.pse.com.ph/stockMarket/home.html",
    },
  });

  const { data } = response;
  if (data.records.length === 0 || data.records === null) {
    return null;
  }

  return data.records as any;
}

async function getSubsectors(): Promise<any> {
  const response = await axios.get("companyInfoSecurityProfile.html?method=getSubsectors&ajax=true", {
    baseURL: "https://www.pse.com.ph/stockMarket/",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "X-Requested-With": "XMLHttpRequest",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Referer": "https://www.pse.com.ph/stockMarket/home.html",
    },
  });

  const { data } = response;
  if (data.records.length === 0 || data.records === null) {
    return null;
  }

  return data.records as any;
}

async function getSecurityId(symbol: string): Promise<number> {
  const response = await axios.get(`home.html?method=findSecurityOrCompany&ajax=true&start=0&limit=1&query=${symbol}`, {
    baseURL: "https://www.pse.com.ph/stockMarket/",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "X-Requested-With": "XMLHttpRequest",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Referer": "https://www.pse.com.ph/stockMarket/home.html",
    },
  });

  const { data } = response;
  if (data.records.length === 0 || data.records === null) {
    return 0;
  }

  return data.records[0].securityId as number;
}

async function getEodData(securityId: number): Promise<any> {
  const response = await axios.get(`companyInfoHistoricalData.html?method=getRecentSecurityQuoteData&ajax=true&start=0&limit=1&security=${securityId}`, {
    baseURL: "https://www.pse.com.ph/stockMarket/",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "X-Requested-With": "XMLHttpRequest",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Referer": "https://www.pse.com.ph/stockMarket/home.html",
    },
  });

  const { data } = response;
  if (data.records.length === 0 || data.records === null) {
    return null;
  }

  const lastTradingData = data.records[0];

  if (ENVIRONMENT === "development") {
    return lastTradingData as any;
  }

  const lastTradingDate = moment(lastTradingData.tradingDate);
  const currentDate = moment();

  if (!currentDate.isSame(lastTradingDate, "day")) {
    return null;
  }

  return lastTradingData as any;
}

async function getEodDataSlice(securityId: number, slices: number): Promise<any> {
  const response = await axios.get(`companyInfoHistoricalData.html?method=getRecentSecurityQuoteData&ajax=true&start=0&limit=1&security=${securityId}`, {
    baseURL: "https://www.pse.com.ph/stockMarket/",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "X-Requested-With": "XMLHttpRequest",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Referer": "https://www.pse.com.ph/stockMarket/home.html",
    },
  });

  const { data } = response;
  if (data.records.length === 0 || data.records === null) {
    return null;
  }

  const lastTradingData = data.records.slice(0, slices);
  return lastTradingData as any;
}
