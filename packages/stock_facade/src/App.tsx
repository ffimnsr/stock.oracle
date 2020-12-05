/// <reference path="./types/mixins.d.ts" />
import React, { useState, useEffect } from "react";
import log from "loglevel";
import { useQuery, useReactiveVar } from "@apollo/client";
import { IconNames } from "@blueprintjs/icons";
import {
  Alignment,
  Navbar,
  Button,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  Classes,
  FocusStyleManager,
  Drawer,
  Position,
} from "@blueprintjs/core";
import Highcharts, { Options as HighchartsOptions } from "highcharts/highstock";
import NoDataToDisplay from "highcharts/modules/no-data-to-display";
import HighchartsReact from "highcharts-react-official";
import styled from "styled-components";
import { StockData } from "@/models/StockData";
import { Stock } from "@/models/Stock";
import { globalStateVar } from "@/Cache";
import { StockSuggest } from "@/components/StockSuggest";
import { StocksTable } from "@/components/StocksTable";
import QueryStockData from "@/graphqls/QueryStockData.graphql";

FocusStyleManager.onlyShowFocusOnTabs();
NoDataToDisplay(Highcharts);

const CustomNavbarHeading = styled(NavbarHeading)`
  width: 95px;
`;

const CustomStockSuggestContainer = styled.div`
  margin-left: 30px;
  width: 420px;
`;

const CustomMain = styled.main`
  padding: 20px;
`;

type ChartProps = {
  stock: Stock;
};

const Chart: React.FC<ChartProps> = ({ stock }) => {
  const { symbol, name } = stock;
  const { loading, error, data } = useQuery(QueryStockData, {
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
    chart: { height: 600 },
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
        height: "80%",
      },
      {
        labels: {
          align: "left",
        },
        top: "82%",
        height: "18%",
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

export function App(): JSX.Element {
  const globalState = useReactiveVar(globalStateVar);
  const [calcDrawerIsOpen, setCalcDrawerIsOpen] = useState(false);

  const handleCalcOpen = () => setCalcDrawerIsOpen(true);
  const handleCalcClose = () => setCalcDrawerIsOpen(false);
  return (
    <div>
      <header>
        <Navbar className={Classes.DARK}>
          <NavbarGroup align={Alignment.LEFT}>
            <CustomNavbarHeading>Stock Oracle</CustomNavbarHeading>
            <NavbarDivider />
            <CustomStockSuggestContainer>
              <StockSuggest />
            </CustomStockSuggestContainer>
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            <Button onClick={handleCalcOpen} minimal={true} icon={IconNames.CALCULATOR} text="Calc" />
            <Button onClick={handleCalcOpen} minimal={true} icon={IconNames.BOOK} text="Journal" />
          </NavbarGroup>
        </Navbar>
      </header>
      <CustomMain>
        <Chart stock={globalState.currentStock} />
        <StocksTable />
      </CustomMain>
      <Drawer
        autoFocus={true}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        enforceFocus={true}
        hasBackdrop={true}
        position={Position.RIGHT}
        usePortal={true}
        size={Drawer.SIZE_STANDARD}
        isOpen={calcDrawerIsOpen}
        icon={IconNames.CALCULATOR}
        onClose={handleCalcClose}
        title="Buy &amp; Sell Calculator"
      >
        <div className={Classes.DRAWER_BODY}>
          <div className={Classes.DIALOG_BODY}>
            Hello
          </div>
        </div>
        <div className={Classes.DRAWER_FOOTER}>Footer</div>
      </Drawer>
    </div>
  );
}
