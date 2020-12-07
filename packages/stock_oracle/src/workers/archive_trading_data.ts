import { parentPort } from "worker_threads";
import log from "loglevel";
import knex from "knex";
import moment from "moment";
import * as ferry from "../ferry";
import { STOCK_DATA_TABLE, STOCK_SYMBOLS_TABLE, isProduction } from "../globals";

log.setLevel(isProduction() ? log.levels.INFO : log.levels.DEBUG);

const client = knex({
  client: "mysql",
  connection: {
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    timezone: "UTC",
    typeCast: (field: any, next: any) => {
      if (field.type === "DATE") {
        return moment(field.string()).toDate();
      }
      return next();
    },
  },
  pool: { min: 0, max: 9 },
});

(async () => {
  try {
    const db = client;
    const symbols = await db
      .from(STOCK_SYMBOLS_TABLE)
      .select("symbol", "company_id", "security_symbol_id");
  
    var comprehensiveStockData: any[] = [];
    for (var i = 0; i < symbols.length; i++) {
      var { symbol, security_symbol_id } = symbols[i];
      const data = await ferry.getEodData(security_symbol_id);

      log.trace(symbol, security_symbol_id);
      parentPort?.postMessage({ success: true, message: `Successfully captured data from ${symbol}` });
  
      if (data === null) {
        parentPort?.postMessage({ success: false, message: `Skipping capture for ${symbol}` });
        continue;
      }
  
      const tradingDate = moment(data.tradingDate);
      comprehensiveStockData.push({
        date: tradingDate.toDate(),
        open: data.sqOpen,
        high: data.sqHigh,
        low: data.sqLow,
        close: data.sqClose,
        volume: data.totalVolume,
        symbol: symbol,
      });
    }
  
    if (comprehensiveStockData.length > 0) {
      await db.batchInsert(STOCK_DATA_TABLE, comprehensiveStockData, 30);
    }

    parentPort?.postMessage({ success: true, message: "Successfully archived data to database" });
  } catch (e) {
    log.error("There were problems storing the data to database: ", e.msg, e.code );
  }
})();


