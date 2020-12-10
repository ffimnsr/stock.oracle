import React, { useState, useEffect } from "react";
import log from "loglevel";
import { useQuery, useReactiveVar } from "@apollo/client";
import Highcharts, { Options as HighchartsOptions } from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import { globalStateVar } from "@/Cache";
import { StockData } from "@/models/Stock";
import Q from "@/operations/queries";

export const StockChart = () => {
  const globalState = useReactiveVar(globalStateVar);
  const { symbol, name } = globalState.currentStock;
  const { loading, error, data } = useQuery(Q.QueryStockData, {
    variables: { symbol },
  });
  const chart = React.createRef<any>();

  if (error) return <div>Error!</div>;

  useEffect(() => {
    const chartObj = (chart.current as any).chart;

    chartObj.hideLoading();
    if (loading) chartObj.showLoading();
  }, [loading]);

  const ohlc = loading
    ? []
    : data.stockData.map((x: StockData) => ({
        x: x.date,
        open: x.open,
        high: x.high,
        low: x.low,
        close: x.close,
      }));

  const volume = loading
    ? []
    : data.stockData.map((x: StockData) => ({
        x: x.date,
        y: x.volume,
      }));

  const options: HighchartsOptions = {
    chart: { height: 900 },
    credits: { enabled: false },
    scrollbar: { enabled: false },
    title: {
      text: `${name.toUpperCase()} (${symbol.toUpperCase()})`,
      align: "left",
    },
    loading: {
      labelStyle: {
        top: "40%",
      },
    },
    yAxis: [
      {
        labels: {
          align: "left",
        },
        height: "70%",
      },
      {
        labels: {
          align: "left",
        },
        top: "72%",
        height: "28%",
        offset: 0,
      },
    ],
    series: [
      {
        type: "candlestick",
        name: name.toUpperCase(),
        data: ohlc,
        dataGrouping: {
          groupPixelWidth: 20,
          units: [
            ["day", [1, 2, 3, 4]],
            ["week", [1, 2, 3, 6]],
            ["month", [1, 2, 3, 6, 9]],
          ],
        },
        tooltip: {
          valueDecimals: 2,
        },
      },
      {
        type: "column",
        name: "Volume",
        data: volume,
        yAxis: 1,
        dataGrouping: {
          groupPixelWidth: 20,
          units: [
            ["day", [1, 2, 3, 4]],
            ["week", [1, 2, 3, 6]],
            ["month", [1, 2, 3, 6, 9]],
          ],
        },
      },
    ],
  };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      constructorType={"stockChart"}
      options={options}
      ref={chart}
    />
  );
};
