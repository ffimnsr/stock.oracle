import React, { useState } from "react";
import _ from "lodash";
import { NetworkStatus, useMutation, useQuery, useReactiveVar } from "@apollo/client";
import {
  currencyFormat,
  CustomMain,
  decimalFormat,
  percentFormat,
  sharesFormat,
  SpinnerLoadExpanded,
} from "@/components/Commons";
import {
  Button,
  Card,
  Classes,
  Dialog,
  EditableText,
  H3,
  H4,
  H5,
  HTMLTable,
  Intent,
  Position,
  Tab,
  Tabs,
  Toaster,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import styled, { createGlobalStyle } from "styled-components";
import BaseTable, { AutoResizer, ColumnShape } from "react-base-table";
import { Journal, Trade, LatestStockDataItem } from "@/models";
import Q from "@/operations/queries";
import M from "@/operations/mutations";
import { internalSymbolsVar } from "@/Cache";
import * as CalcUtility from "@/utils/CalcUtility";
import { AddTradeForm } from "@/components/AddTradeForm";
import { AddJournalForm } from "@/components/AddJournalForm";
import log from "loglevel";
import classNames from "classnames";

type LocalQueryJournals = {
  journals: Journal[];
};

type LocalQueryActiveTrades = {
  activeTrades: Trade[];
};

type LocalQueryLatestStockData = {
  latestStockData: LatestStockDataItem[];
};

type RowRendererParams = {
  isScrolling: boolean;
  cells: React.ReactNode[];
  rowData: any;
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

const CustomTd = styled.td`
  padding: 3px 0 !important;
  box-shadow: none !important;
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
const generateData = (
  columns: ColumnShape[],
  data: Trade[],
  symbols: string[],
  latestStockData: LatestStockDataItem[],
) =>
  data.map((row, rowIndex: number) => {
    return columns.reduce(
      (rowData: any, column: any, columnIndex: any) => {
        const symbol = symbols[parseInt(row.stockId)];
        const stockData = latestStockData.find((x) => x.symbol === symbol);
        const lastPrice = stockData!.close;
        const totalCost = row.avgBuyPrice * row.shares;
        const marketValue = lastPrice * row.shares;
        const changePL = CalcUtility.computeChange(marketValue, totalCost);
        const changePercPL = CalcUtility.computeChangePercentage(
          lastPrice,
          row.avgBuyPrice,
        );

        if (columnIndex == 0) rowData[column.dataKey] = symbol;
        if (columnIndex == 1) rowData[column.dataKey] = row.type;
        if (columnIndex == 2) rowData[column.dataKey] = currencyFormat(row.avgBuyPrice);
        if (columnIndex == 3) rowData[column.dataKey] = currencyFormat(lastPrice);
        if (columnIndex == 4) rowData[column.dataKey] = sharesFormat(row.shares);
        if (columnIndex == 5) rowData[column.dataKey] = currencyFormat(totalCost);
        if (columnIndex == 6) rowData[column.dataKey] = currencyFormat(marketValue);
        if (columnIndex == 7) rowData[column.dataKey] = decimalFormat(changePL);
        if (columnIndex == 8) rowData[column.dataKey] = percentFormat(changePercPL);

        return rowData;
      },
      {
        id: `${rowPrefix}${rowIndex}`,
        parentId: null,
      },
    );
  });

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

const AddRenameSuccessToaster = Toaster.create({
  position: Position.TOP,
});

const showSuccessToast = () => {
  AddRenameSuccessToaster.show({
    intent: Intent.SUCCESS,
    message: "Successfully renamed journal!",
  });
};

const JournalTable = ({ journal }: { journal: Journal }) => {
  const [renameJournal] = useMutation(M.MutationRenameJournal, {
    onCompleted: () => {
      showSuccessToast();
    },
  });
  const internalSymbols = useReactiveVar(internalSymbolsVar);
  const [addTradeDialogIsOpen, setAddTradeDialogIsOpen] = useState(false);
  const [currentJournalName, setCurrentJournalName] = useState(journal.name);
  const tradesActiveQuery = useQuery(Q.QueryTradesActive, {
    variables: { id: journal.id },
    notifyOnNetworkStatusChange: true,
  });
  const latestStockDataQuery = useQuery(Q.QueryLatestStockData);

  if (tradesActiveQuery.error && latestStockDataQuery.error) return <div>Error!</div>;
  if (
    latestStockDataQuery.loading ||
    tradesActiveQuery.loading ||
    tradesActiveQuery.networkStatus === NetworkStatus.refetch
  )
    return <SpinnerLoadExpanded />;

  const { activeTrades } = tradesActiveQuery.data as LocalQueryActiveTrades;
  const { latestStockData } = latestStockDataQuery.data as LocalQueryLatestStockData;

  const totalEquity = activeTrades
    .map((x) => {
      const symbol = internalSymbols[parseInt(x.stockId)];
      const shares = x.shares;
      const trades = latestStockData.find((y) => y.symbol === symbol);
      const result = shares * trades!.close;
      log.trace(result);

      return result;
    })
    .reduce((total, num) => total + num);

  const items = generateData(columns, activeTrades, internalSymbols, latestStockData);

  const handleAddTradeDialogOpen = () => setAddTradeDialogIsOpen(true);
  const handleAddTradeDialogClose = () => setAddTradeDialogIsOpen(false);
  const handleAddTradeDialogCloseSuccess = () => {
    setAddTradeDialogIsOpen(false);
    tradesActiveQuery.refetch();
  };
  const handleJournalNameChange = (value: string) => setCurrentJournalName(value);

  const onJournalRenameConfirm = async (value: string) => {
    await renameJournal({
      variables: {
        input: {
          id: journal.id,
          name: value,
        },
      },
    });
  };

  const porfolioDetails = [
    {
      name: "Total Realized Profits",
      value: currencyFormat(0.0),
    },
    {
      name: "Total Realized Profits (%)",
      value: percentFormat(0.0),
    },
    {
      name: "Total Current Cost",
      value: currencyFormat(0.0),
    },
    {
      name: "Total Current Market Value",
      value: currencyFormat(0.0),
    },
    {
      name: "Total Current Profit/Loss",
      value: decimalFormat(0.0),
    },
    {
      name: "Total Current Profit/Loss (%)",
      value: percentFormat(0.0),
    },
  ];

  const portfolioDetailsComponents = porfolioDetails.map((x, index) => {
    return (
      <tr key={index}>
        <CustomTd className={classNames(Classes.TEXT_SMALL)}>{x.name}</CustomTd>
        <CustomTd
          className={classNames(Classes.TEXT_SMALL)}
          style={{ textAlign: "right" }}
        >
          {x.value}
        </CustomTd>
      </tr>
    );
  });

  return (
    <section>
      <SplitContainer>
        <InnerContainer>
          <div className={classNames(Classes.TEXT_SMALL)}>
            Philippine Stock Exchange (PSE)
          </div>
          <H3 style={{ marginTop: "5px", marginBottom: "20px" }}>
            <EditableText
              alwaysRenderInput={false}
              maxLength={12}
              placeholder="Edit journal name..."
              selectAllOnFocus={false}
              value={currentJournalName}
              onChange={handleJournalNameChange}
              onConfirm={onJournalRenameConfirm}
            />
          </H3>
          <div className={classNames(Classes.TEXT_SMALL)}>Total Equity</div>
          <H4 style={{ marginTop: "5px" }}>{currencyFormat(totalEquity)}</H4>
          <div className={classNames(Classes.TEXT_SMALL)}>Available Cash</div>
          <H4 style={{ marginTop: "5px" }}>{currencyFormat(0.0)}</H4>
        </InnerContainer>
        <InnerContainer>
          <H5>Portfolio Details</H5>
          <HTMLTable
            style={{ width: "100%" }}
            bordered={false}
            condensed={true}
            striped={true}
            interactive={true}
          >
            <tbody>{portfolioDetailsComponents}</tbody>
          </HTMLTable>
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
          <AddTradeForm
            journalId={journal.id}
            closeCb={handleAddTradeDialogCloseSuccess}
          />
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
        panel={<JournalTable journal={x} />}
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
