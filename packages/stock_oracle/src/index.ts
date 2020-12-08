import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import compression from "compression";
import responseTime from "response-time";
import basicAuth from "express-basic-auth";
import log from "loglevel";
import { ApolloServer } from "apollo-server-express";
import knex from "knex";
import moment from "moment";
import _ from "lodash";
import { isMainThread, Worker } from "worker_threads";
import {
  isProduction,
  ENVIRONMENT,
  PORT,
  BATCH_INSERT_CHUNK_SIZE,
  STOCK_DATA_TABLE,
  STOCK_SECURITY_TYPES_TABLE,
  STOCK_SECTORS_TABLE,
  STOCK_SUBSECTORS_TABLE,
  STOCK_SYMBOLS_TABLE,
} from "./globals";
import * as ferry from "./ferry";
import typeDefs from "./typedefs";
import resolvers from "./resolvers";

log.setLevel(isProduction() ? log.levels.INFO : log.levels.DEBUG);
log.info("Current environment:", ENVIRONMENT);
log.info("Current stock data table:", STOCK_DATA_TABLE);

const client = knex({
  client: "mysql",
  connection: {
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    timezone: "UTC",
    typeCast: (field: any, next: any) => {
      if (field.type === "DATE" || field.type === "DATETIME") {
        return moment(field.string()).toDate();
      }
      return next();
    },
  },
  pool: { min: 0, max: 9 },
});

const snakeCaseFieldResolver = (
  source: any,
  _args: any,
  _context: any,
  info: any
) => {
  return source[_.snakeCase(info.fieldName)];
};

const server = new ApolloServer({
  fieldResolver: snakeCaseFieldResolver,
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    db: req.app.get("dao") as knex,
  }),
});
const app = express();

app.set("dao", client);
app.use(
  cors({
    credentials: true,
    origin: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  })
);

if (isProduction()) {
  app.use(
    basicAuth({
      users: { oracle_admin: "oracle_pass" },
      challenge: true,
      realm: "The Stock Oracle",
    })
  );
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(compression());
app.use(responseTime());

server.applyMiddleware({ app });

app.get("/", (_req: Request, res: Response) => {
  res.send("Stock Oracle");
});

app.post(
  "/management/fill_security_types",
  async (req: Request, res: Response) => {
    try {
      const db = req.app.get("dao") as knex;
      const securityTypesRaw = await ferry.getSecurityTypes();
      const securityTypes = securityTypesRaw.map((securityType: any) => ({
        code: securityType.code,
        name: securityType.name,
      }));

      await db.batchInsert(
        STOCK_SECURITY_TYPES_TABLE,
        securityTypes,
        BATCH_INSERT_CHUNK_SIZE
      );

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
  }
);

app.post("/management/fill_sectors", async (req: Request, res: Response) => {
  try {
    const db = req.app.get("dao") as knex;
    const sectorsRaw = await ferry.getSectors();
    const sectors = sectorsRaw.map((sector: any) => ({
      index_id: sector.indexId,
      code: sector.indexAbb,
      name: sector.indexName,
      is_sectoral: sector.isSectoral === "Y" ? 1 : 0,
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
    const sectorsRaw = await ferry.getSubsectors();
    const sectors = sectorsRaw.map((sector: any) => ({
      index_id: sector.indexId,
      name: sector.subsectorName,
      internal_pse_id: sector.subsectorID,
    }));

    await db.batchInsert(
      STOCK_SUBSECTORS_TABLE,
      sectors,
      BATCH_INSERT_CHUNK_SIZE
    );

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

app.post(
  "/management/fill_listed_companies",
  async (req: Request, res: Response) => {
    try {
      const db = req.app.get("dao") as knex;
      const listedCompaniesRaw = await ferry.getListedCompanies();
      const listedCompanies = listedCompaniesRaw.map((company: any) => ({
        symbol: company.securitySymbol,
        name: company.securityName,
        status: 1,
        listed_date: moment(company.listingDate).toDate(),
        security_status: company.securityStatus,
        security_type: company.securityType,
        subsector_id: company.subsectorName,
        sector_id: company.indexName,
        company_id: company.companyId,
        security_symbol_id: company.securitySymbolId,
      }));

      await db.batchInsert(
        STOCK_SYMBOLS_TABLE,
        listedCompanies,
        BATCH_INSERT_CHUNK_SIZE
      );

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
  }
);

app.get(
  "/management/get_stock_security_id/:symbol",
  async (req: Request, res: Response) => {
    try {
      const { symbol } = req.params;
      const securityId = await ferry.getSecurityId(symbol);

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
  }
);

app.post(
  "/management/archive_last_trading_stock_data",
  async (_req: Request, res: Response) => {
    if (isMainThread) {
      let worker = new Worker(__dirname + "/workers/archive_trading_data.js");
      worker.on("message", (data) => {
        log.trace(data);
      });
      worker.on("error", (e) => {
        log.error("Unable to archive data: " + e.message);
      });
      worker.on("exit", (code) => {
        if (code !== 0) {
          log.error("Unable to archive data code: ", code);
        }

        log.info("Successfully archived last trading data to database");
      });
    }

    res.json({
      success: true,
      message:
        "Successfully queued last trading data for processing to database.",
    });
  }
);

app.post(
  "/management/archive_trading_stock_data/:slicesRaw",
  async (req: Request, res: Response) => {
    const { slicesRaw } = req.params;
    if (isMainThread) {
      let worker = new Worker(
        __dirname + "/workers/archive_trading_data_with_n.js",
        {
          workerData: {
            slicesRaw,
          },
        }
      );
      worker.on("message", (data) => {
        log.trace(data);
      });
      worker.on("error", (e) => {
        log.error("Unable to archive data: " + e.message);
      });
      worker.on("exit", (code) => {
        if (code !== 0) {
          log.error("Unable to archive data code: ", code);
        }

        log.info("Successfully archived last trading data to database");
      });
    }

    res.json({
      success: true,
      message:
        "Successfully queued last trading data for processing to database.",
    });
  }
);

app.listen({ port: PORT }, function () {
  log.info(`Server now listening in port ${PORT}`);
});
