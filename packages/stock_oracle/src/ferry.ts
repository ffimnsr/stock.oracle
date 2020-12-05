import axios from "axios";
import moment from "moment";

const ENVIRONMENT = process.env.NODE_ENV || "production";

export async function getListedCompanies(): Promise<any> {
  const response = await axios.get(
    "companyInfoSecurityProfile.html?method=getListedRecords&common=yes&ajax=true",
    {
      baseURL: "https://www.pse.com.ph/stockMarket/",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "X-Requested-With": "XMLHttpRequest",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        Referer: "https://www.pse.com.ph/stockMarket/home.html",
      },
    }
  );

  const { data } = response;
  if (data.records.length === 0 || data.records === null) {
    return null;
  }

  return data.records as any;
}

export async function getSecurityTypes(): Promise<any> {
  const response = await axios.get(
    "companyInfoSecurityProfile.html?method=getSecurityTypes&ajax=true",
    {
      baseURL: "https://www.pse.com.ph/stockMarket/",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "X-Requested-With": "XMLHttpRequest",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        Referer: "https://www.pse.com.ph/stockMarket/home.html",
      },
    }
  );

  const { data } = response;
  if (data.records.length === 0 || data.records === null) {
    return null;
  }

  return data.records as any;
}

export async function getSectors(): Promise<any> {
  const response = await axios.get(
    "companyInfoSecurityProfile.html?method=getSectors&ajax=true",
    {
      baseURL: "https://www.pse.com.ph/stockMarket/",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "X-Requested-With": "XMLHttpRequest",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        Referer: "https://www.pse.com.ph/stockMarket/home.html",
      },
    }
  );

  const { data } = response;
  if (data.records.length === 0 || data.records === null) {
    return null;
  }

  return data.records as any;
}

export async function getSubsectors(): Promise<any> {
  const response = await axios.get(
    "companyInfoSecurityProfile.html?method=getSubsectors&ajax=true",
    {
      baseURL: "https://www.pse.com.ph/stockMarket/",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "X-Requested-With": "XMLHttpRequest",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        Referer: "https://www.pse.com.ph/stockMarket/home.html",
      },
    }
  );

  const { data } = response;
  if (data.records.length === 0 || data.records === null) {
    return null;
  }

  return data.records as any;
}

export async function getSecurityId(symbol: string): Promise<number> {
  const response = await axios.get(
    `home.html?method=findSecurityOrCompany&ajax=true&start=0&limit=1&query=${symbol}`,
    {
      baseURL: "https://www.pse.com.ph/stockMarket/",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "X-Requested-With": "XMLHttpRequest",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        Referer: "https://www.pse.com.ph/stockMarket/home.html",
      },
    }
  );

  const { data } = response;
  if (data.records.length === 0 || data.records === null) {
    return 0;
  }

  return data.records[0].securityId as number;
}

export async function getEodData(securityId: number): Promise<any> {
  const response = await axios.get(
    `companyInfoHistoricalData.html?method=getRecentSecurityQuoteData&ajax=true&start=0&limit=1&security=${securityId}`,
    {
      baseURL: "https://www.pse.com.ph/stockMarket/",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "X-Requested-With": "XMLHttpRequest",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        Referer: "https://www.pse.com.ph/stockMarket/home.html",
      },
    }
  );

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

export async function getEodDataSlice(
  securityId: number,
  slices: number
): Promise<any> {
  const response = await axios.get(
    `companyInfoHistoricalData.html?method=getRecentSecurityQuoteData&ajax=true&start=0&limit=1&security=${securityId}`,
    {
      baseURL: "https://www.pse.com.ph/stockMarket/",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "X-Requested-With": "XMLHttpRequest",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        Referer: "https://www.pse.com.ph/stockMarket/home.html",
      },
    }
  );

  const { data } = response;
  if (data.records.length === 0 || data.records === null) {
    return null;
  }

  const lastTradingData = data.records.slice(0, slices);
  return lastTradingData as any;
}
