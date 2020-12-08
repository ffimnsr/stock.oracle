import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { CustomMain, SpinnerLoad } from "@/components/Commons";
import { Tab, Tabs } from "@blueprintjs/core";
import styled, { createGlobalStyle } from "styled-components";
import { Journal } from "@/models/Journal";
import { Trade } from "@/models/Trade";
import QueryJournals from "@/graphqls/QueryJournals.graphql";
import QueryTrades from "@/graphqls/QueryTrades.graphql";
import BaseTable, { AutoResizer, ColumnShape } from "react-base-table";

type LocalQueryJournals = {
  journals: Journal[];
};

type LocalQueryTrades = {
  trades: Trade[];
};

type JournalTableProps = {
  journalId: string;
};

const TabGlobalStyle = createGlobalStyle`
  .custom-tab-panel-container {
    width: 100%;
  }
`;

const TabContent = styled.div`
  display: flex;
  width: 100%;
  height: 92vh;
`;

const getColumnWidth = (columnIndex: number) => {
  let width = 150;
  if (columnIndex == 0) width = 60;
  if (columnIndex == 1) width = 60;
  if (columnIndex == 2) width = 80;
  if (columnIndex == 3) width = 60;

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

const columnNames = ["Transaction Date", "Type", "Avg. Price", "Shares"];
const columns = generateColumns(columnNames);
const generateData = (columns: any, data: Trade[]) =>
  data.map((row, rowIndex: number) => {
    return columns.reduce(
      (rowData: any, column: any, columnIndex: any) => {
        if (columnIndex == 0) rowData[column.dataKey] = row.transactionDateStart;
        if (columnIndex == 1) rowData[column.dataKey] = row.type;
        if (columnIndex == 2) rowData[column.dataKey] = row.avgBuyPrice;
        if (columnIndex == 3) rowData[column.dataKey] = row.shares;

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

const JournalTable = ({ journalId }: JournalTableProps) => {
  const { loading, error, data } = useQuery(QueryTrades, {
    variables: { id: journalId },
  });

  if (error) return <div>Error!</div>;
  if (loading) return <SpinnerLoad />;
  
  const { trades } = data as LocalQueryTrades;
  const items = generateData(columns, trades);

  return (
    <TabContent>
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
    </TabContent>
  );
};

export const AppJournal = () => {
  const { loading, error, data } = useQuery(QueryJournals);

  if (error) return <div>Error!</div>;
  if (loading) return <SpinnerLoad />;

  const { journals } = data as LocalQueryJournals;
  const tabs = journals.map((x) => (
    <Tab
      id={x.id}
      key={x.id}
      title={x.name}
      panelClassName="custom-tab-panel-container"
      panel={<JournalTable journalId={x.id} />}
    />
  ));

  return (
    <CustomMain>
      <TabGlobalStyle />
      <Tabs
        id="journals"
        key="journals-vertical"
        animate={true}
        large={true}
        vertical={true}
        renderActiveTabPanelOnly={true}
      >
        {tabs}
      </Tabs>
    </CustomMain>
  );
};
