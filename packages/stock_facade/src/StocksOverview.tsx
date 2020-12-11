import React from "react";
import log from "loglevel";
import { useQuery } from "@apollo/client";
import styled from "styled-components";
import BaseTable, { AutoResizer, Column, ColumnShape } from "react-base-table";
import { LatestStockDataItem, Stock } from "@/models";
import Q from "@/operations/queries";
import { currencyFormat, CustomMain, normalFormat } from "@/components/Commons";
import classNames from "classnames";
import { Classes } from "@blueprintjs/core";

const getColumnWidth = (columnIndex: number) => {
  let width = 150;
  if (columnIndex == 0) width = 60;
  if (columnIndex == 1) width = 600;
  if (columnIndex == 2) width = 80;
  if (columnIndex == 3) width = 100;
  if (columnIndex == 4) width = 100;

  return width;
};

const columnPrefix = "column-";
const rowPrefix = "row-";
const generateColumns = (columnNames: string[]) =>
  columnNames.map(
    (columnName: string, columnIndex: number): ColumnShape => ({
      key: `${columnPrefix}${columnIndex}`,
      dataKey: `${columnPrefix}${columnIndex}`,
      title: columnName,
      width: getColumnWidth(columnIndex),
      flexGrow: 1,
      flexShrink: 0,
    }),
  );

const columnNames = ["Symbol", "Name", "Symbol", "Last Price", "Volume"];
const columns = generateColumns(columnNames);
const generateData = (
  columns: any,
  data: Stock[],
  latestStockData: LatestStockDataItem[],
) =>
  data.map((row, rowIndex: number) => {
    return columns.reduce(
      (rowData: any, column: any, columnIndex: any) => {
        const symbol = row.symbol;
        const stockData = latestStockData.find((x) => x.symbol === symbol);

        if (columnIndex == 0) rowData[column.dataKey] = symbol;
        if (columnIndex == 1) rowData[column.dataKey] = row.name;
        if (columnIndex == 2) rowData[column.dataKey] = symbol;
        if (columnIndex == 3)
          rowData[column.dataKey] = stockData ? currencyFormat(stockData.close) : 0;
        if (columnIndex == 4)
          rowData[column.dataKey] = stockData ? normalFormat(stockData.volume) : 0;

        return rowData;
      },
      {
        id: `${rowPrefix}${rowIndex}`,
        parentId: null,
      },
    );
  });

type RowRendererParams = {
  isScrolling: boolean;
  cells: React.ReactNode[];
  rowData: any;
};

const rowRenderer = ({ isScrolling, cells, rowData }: RowRendererParams) => {
  if (isScrolling) {
    return cells.map((x, index) => {
      return (
        <div
          key={index}
          role="gridcell"
          className="BaseTable__row-cell"
          style={(x as React.ReactElement).props.style}
        >
          <div className={classNames("BaseTable__row-cell-text", Classes.SKELETON)}>
            {rowData[`column-${index}`]}
          </div>
        </div>
      );
    });
  }

  return cells;
};

const Container = styled.div`
  height: 600px;
`;

const StocksTable = (): JSX.Element => {
  const stocksQuery = useQuery(Q.QueryStocks);
  const latestStockDataQuery = useQuery(Q.QueryLatestStockData);

  if (stocksQuery.error || latestStockDataQuery.error) return <div>Error!</div>;

  const stocks: Stock[] = stocksQuery.loading ? [] : stocksQuery.data.stocks;
  const latestStockData: LatestStockDataItem[] = latestStockDataQuery.loading
    ? []
    : latestStockDataQuery.data.latestStockData;
  const items = generateData(columns, stocks, latestStockData);

  return (
    <Container>
      <AutoResizer>
        {({ height, width }) => (
          <BaseTable
            height={height}
            width={width}
            columns={columns}
            data={items}
            useIsScrolling={true}
            rowRenderer={rowRenderer}
          />
        )}
      </AutoResizer>
    </Container>
  );
};

export const AppStocksOverview = () => {
  return (
    <CustomMain>
      <StocksTable />
    </CustomMain>
  );
};
