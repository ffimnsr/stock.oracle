import React, { useState } from "react";
import _ from "lodash";
import { NetworkStatus, useQuery, useReactiveVar } from "@apollo/client";
import { CustomMain, SpinnerLoadExpanded } from "@/components/Commons";
import {
  Button,
  Card,
  Dialog,
  Intent,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import styled, { createGlobalStyle } from "styled-components";
import BaseTable, { AutoResizer, ColumnShape } from "react-base-table";
import { Journal } from "@/models/Journal";
import { Trade } from "@/models/Trade";
import Q from "@/operations/queries";
import { internalSymbolsVar } from "@/Cache";
import * as CalcUtility from "@/utils/CalcUtility";
import { JournalCommonProps } from "@/components/Commons";
import { AddTradeForm } from "@/components/AddTradeForm";
import { AddJournalForm } from "@/components/AddJournalForm";

type LocalQueryJournals = {
  journals: Journal[];
};

type LocalQueryTrades = {
  activeTrades: Trade[];
};

type RowRendererParams = {
  isScrolling: boolean;
  cells: React.ReactNode[];
};

const TabGlobalStyle = createGlobalStyle`
  .custom-tab-panel-container {
    width: 100%;
  }
`;

const TabContent = styled.div`
  display: flex;
  width: 100%;
  height: 80vh;
`;

const LoadingCell = styled.div`
  margin: auto;
`;

const SplitContainer = styled.div`
  display: flex;
`;

const InnerContainer = styled(Card)`
  flex: 1;
  margin: 5px;
`;

const JournalButtonContainer = styled.div`
  display: flex;
  justify-content: right;
  margin: 10px;
`;

const getColumnWidth = (columnIndex: number) => {
  let width = 150;
  if (columnIndex == 0) width = 90;
  if (columnIndex == 1) width = 60;
  if (columnIndex == 2) width = 80;
  if (columnIndex == 3) width = 60;
  if (columnIndex == 4) width = 60;
  if (columnIndex == 5) width = 60;
  if (columnIndex == 6) width = 60;
  if (columnIndex == 7) width = 60;
  if (columnIndex == 8) width = 60;

  return width;
};

const columnPrefix = "column-";
const rowPrefix = "row-";
const generateColumns = (columnNames: string[]): ColumnShape[] =>
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

const columnNames = [
  "Stock",
  "Type",
  "Avg. Price",
  "Last Price",
  "Shares",
  "Total Cost",
  "Market Value",
  "Profit/Loss",
  "Profit/Loss (%)",
];

const columns = generateColumns(columnNames);
const generateData = (columns: ColumnShape[], data: Trade[], symbols: string[]) =>
  data.map((row, rowIndex: number) => {
    return columns.reduce(
      (rowData: any, column: any, columnIndex: any) => {
        const lastPrice = 2.0;
        const totalCost = row.avgBuyPrice * row.shares;
        const marketValue = lastPrice * row.shares;
        const changePL = CalcUtility.computeChange(marketValue, totalCost);
        const changePercPL = CalcUtility.computeChangePercentage(
          lastPrice,
          row.avgBuyPrice,
        );

        let numberFormatOptions = {
          style: "currency",
          currency: "PHP",
          minimumFractionDigits: 2,
        };

        if (columnIndex == 0) rowData[column.dataKey] = symbols[parseInt(row.stockId)];
        if (columnIndex == 1) rowData[column.dataKey] = row.type;
        if (columnIndex == 2)
          rowData[column.dataKey] = Intl.NumberFormat(
            "en-PH",
            numberFormatOptions,
          ).format(row.avgBuyPrice);
        if (columnIndex == 3)
          rowData[column.dataKey] = Intl.NumberFormat(
            "en-PH",
            numberFormatOptions,
          ).format(lastPrice);
        if (columnIndex == 4)
          rowData[column.dataKey] = Intl.NumberFormat("en-PH", {
            minimumFractionDigits: 1,
          }).format(row.shares);
        if (columnIndex == 5)
          rowData[column.dataKey] = Intl.NumberFormat(
            "en-PH",
            numberFormatOptions,
          ).format(totalCost);
        if (columnIndex == 6)
          rowData[column.dataKey] = Intl.NumberFormat(
            "en-PH",
            numberFormatOptions,
          ).format(marketValue);
        if (columnIndex == 7)
          rowData[column.dataKey] = Intl.NumberFormat("en-PH", {
            style: "decimal",
            minimumFractionDigits: 2,
          }).format(changePL);
        if (columnIndex == 8)
          rowData[column.dataKey] = Intl.NumberFormat("en-PH", {
            style: "percent",
            minimumFractionDigits: 2,
          }).format(changePercPL);

        return rowData;
      },
      {
        id: `${rowPrefix}${rowIndex}`,
        parentId: null,
      },
    );
  });

const rowRenderer = ({ isScrolling, cells }: RowRendererParams) => {
  if (isScrolling) return <LoadingCell>Loading</LoadingCell>;

  return cells;
};

const JournalTable = ({ journalId }: JournalCommonProps) => {
  const internalSymbols = useReactiveVar(internalSymbolsVar);
  const [addTradeDialogIsOpen, setAddTradeDialogIsOpen] = useState(false);
  const { loading, error, data, refetch, networkStatus } = useQuery(Q.QueryTradesActive, {
    variables: { id: journalId },
    notifyOnNetworkStatusChange: true,
  });

  if (error) return <div>Error!</div>;
  if (loading || networkStatus === NetworkStatus.refetch) return <SpinnerLoadExpanded />;

  const { activeTrades } = data as LocalQueryTrades;
  const items = generateData(columns, activeTrades, internalSymbols);

  const handleAddTradeDialogOpen = () => setAddTradeDialogIsOpen(true);
  const handleAddTradeDialogClose = () => setAddTradeDialogIsOpen(false);
  const handleAddTradeDialogCloseSuccess = () => {
    setAddTradeDialogIsOpen(false);
    refetch();
  };

  return (
    <section>
      <SplitContainer>
        <InnerContainer>
          Hello
        </InnerContainer>
        <InnerContainer>
          Hello
        </InnerContainer>        
      </SplitContainer>
      <JournalButtonContainer>
        <Button icon={IconNames.MANUALLY_ENTERED_DATA} onClick={handleAddTradeDialogOpen}>
          Add Trade
        </Button>
        <Dialog
          icon={IconNames.MANUALLY_ENTERED_DATA}
          title="Add Trade"
          isOpen={addTradeDialogIsOpen}
          canEscapeKeyClose={false}
          canOutsideClickClose={true}
          autoFocus={true}
          enforceFocus={true}
          usePortal={true}
          onClose={handleAddTradeDialogClose}
        >
          <AddTradeForm journalId={journalId} closeCb={handleAddTradeDialogCloseSuccess} />
        </Dialog>
      </JournalButtonContainer>
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
    </section>
  );
};

const AddNewJournalButton = () => {
  const [addJournalDialogIsOpen, setAddJournalDialogIsOpen] = useState(false);

  const handleAddJournalDialogOpen = () => setAddJournalDialogIsOpen(true);
  const handleAddJournalDialogClose = () => setAddJournalDialogIsOpen(false);

  return (
    <div>
      <Button
        onClick={handleAddJournalDialogOpen}
        outlined={true}
        fill={true}
        icon={IconNames.ADD}
        intent={Intent.PRIMARY}
      >
        New Journal
      </Button>
      <Dialog
        icon={IconNames.MANUALLY_ENTERED_DATA}
        title="Add Journal"
        isOpen={addJournalDialogIsOpen}
        canEscapeKeyClose={false}
        canOutsideClickClose={true}
        autoFocus={true}
        enforceFocus={true}
        usePortal={true}
        onClose={handleAddJournalDialogClose}
      >
        <AddJournalForm />
      </Dialog>
    </div>
  );
};

export const AppJournal = () => {
  const { loading, error, data } = useQuery(Q.QueryJournals);

  if (error) return <div>Error!</div>;
  if (loading) return <SpinnerLoadExpanded />;

  const { journals } = data as LocalQueryJournals;
  const tabs = journals.map((x) => {
    const truncateName = _.truncate(x.name, { length: 18 });
    return (
      <Tab
        id={x.id}
        key={x.id}
        title={truncateName}
        panelClassName="custom-tab-panel-container"
        panel={<JournalTable journalId={x.id} />}
      />
    );
  });

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
        <Tabs.Expander />
        <AddNewJournalButton />
      </Tabs>
    </CustomMain>
  );
};
