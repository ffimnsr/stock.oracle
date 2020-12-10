import React from "react";
import log from "loglevel";
import { useQuery } from "@apollo/client";
import styled from "styled-components";
import BaseTable, { AutoResizer, Column, ColumnShape } from "react-base-table";
import { Stock } from "@/models/Stock";
import Q from "@/operations/queries";
import { CustomMain } from "@/components/Commons";

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
  columnNames.map((columnName: string, columnIndex: number): ColumnShape => ({
    key: `${columnPrefix}${columnIndex}`,
    dataKey: `${columnPrefix}${columnIndex}`,
    title: columnName,
    width: getColumnWidth(columnIndex), 
    flexGrow: 1,
    flexShrink: 0,
  }));

const columnNames = ["ID", "Name", "Symbol", "Company ID", "Security Symbol ID"];
const columns = generateColumns(columnNames);
const generateData = (columns: any, data: Stock[]) =>
  data.map((row, rowIndex: number) => {
    return columns.reduce(
      (rowData: any, column: any, columnIndex: any) => {
        if (columnIndex == 0) rowData[column.dataKey] = row.id;
        if (columnIndex == 1) rowData[column.dataKey] = row.name;
        if (columnIndex == 2) rowData[column.dataKey] = row.symbol;
        if (columnIndex == 3) rowData[column.dataKey] = row.companyId;
        if (columnIndex == 4) rowData[column.dataKey] = row.securitySymbolId;

        return rowData
      },
      {
        id: `${rowPrefix}${rowIndex}`,
        parentId: null,
      }
    );
  });

type RowRendererParams = {
  isScrolling: boolean;
  cells: React.ReactNode[];
};

const LoadingCell = styled.div`
  margin: auto;
`;

const rowRenderer = ({ isScrolling, cells }: RowRendererParams) => {
  if (isScrolling) return <LoadingCell>Loading</LoadingCell>;
  
  return cells;
};

const Container = styled.div`
  height: 600px;
`;

const StocksTable = (): JSX.Element => {
  const { loading, error, data } = useQuery(Q.QueryStocks);

  if (error) return <div>Error!</div>;

  const stocks: Stock[] = loading ? [] : data.stocks;
  const items = generateData(columns, stocks);

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