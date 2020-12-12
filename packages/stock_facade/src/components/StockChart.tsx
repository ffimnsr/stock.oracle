import React, { useState, useEffect } from "react";
import log from "loglevel";
import { useQuery, useReactiveVar } from "@apollo/client";
import Highcharts, { Options as HighchartsOptions } from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import HSIndicators from "highcharts/indicators/indicators-all";
import HSTheme from "highcharts/themes/grid-light";
import { globalStateVar } from "@/Cache";
import { StockDataItem } from "@/models";
import Q from "@/operations/queries";

HSIndicators(Highcharts);
HSTheme(Highcharts);

export const StockChart = React.memo(() => {
  const globalState = useReactiveVar(globalStateVar);
  const { symbol, name } = globalState.currentStock;
  const { loading, error, data } = useQuery(Q.QueryStockData, {
    variables: { symbol },
    fetchPolicy: "no-cache",
  });

  const chartRef = React.createRef<any>();

  if (error) return <div>Error!</div>;

  useEffect(() => {
    const currentChart = chartRef.current;
    if (currentChart) {
      const chartObj = currentChart.chart;

      chartObj.hideLoading();
      if (loading) chartObj.showLoading();
    }
  }, [loading]);

  const ohlc = loading
    ? []
    : data.stockData.map((x: StockDataItem) => ({
        x: x.date,
        open: x.open,
        high: x.high,
        low: x.low,
        close: x.close,
      }));

  const navigator = loading
    ? []
    : data.stockData.map((x: StockDataItem) => ({
        x: x.date,
        y: x.close,
      }));

  const options: HighchartsOptions = {
    chart: { height: 900 },
    credits: { enabled: false },
    scrollbar: { enabled: false },
    tooltip: { enabled: false },
    title: {
      text: `${name.toUpperCase()} (${symbol.toUpperCase()})`,
      align: "left",
    },
    loading: {
      labelStyle: {
        top: "40%",
      },
    },
    navigator: {
      adaptToUpdatedData: true,
      height: 90,
      series: {
        data: navigator,
        dataGrouping: { smoothed: true },
      },
    },
    rangeSelector: {
      selected: 5,
    },
    yAxis: [
      {
        labels: {
          align: "left",
          x: 30,
        },
        height: "100%",
        width: "99%",
      },
    ],
    series: [
      {
        type: "candlestick",
        name: name.toUpperCase(),
        id: `chart-${symbol.toLowerCase()}`,
        data: ohlc,
        color: "#ff6962",
        lineColor: "#ff6962",
        upColor: "#56c7d0",
        upLineColor: "#56c7d0",        
        dataGrouping: {
          groupPixelWidth: 20,
          approximation: "ohlc",
        },
        navigatorOptions: { showInNavigator: false },
      },
    ],
  };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      constructorType={"stockChart"}
      options={options}
      ref={chartRef}
    />
  );
});
