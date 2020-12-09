import React, { useState, useEffect, useMemo } from "react";
import log from "loglevel";
import moment from "moment";
import { useQuery, useReactiveVar } from "@apollo/client";
import { CustomMain, SpinnerLoadExpanded } from "@/components/Commons";
import {
  Button,
  Card,
  Classes,
  ControlGroup,
  Dialog,
  FormGroup,
  HTMLSelect,
  Icon,
  Intent,
  NumericInput,
  Position,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import styled, { createGlobalStyle } from "styled-components";
import BaseTable, { AutoResizer, ColumnShape } from "react-base-table";
import { useForm } from "react-hook-form";
import { Journal } from "@/models/Journal";
import { Trade, TradeStatus } from "@/models/Trade";
import QueryJournals from "@/graphqls/QueryJournals.graphql";
import QueryTradesActive from "@/graphqls/QueryTradesActive.graphql";
import { useStickyState } from "@/Hooks";
import { internalSymbolsVar } from "@/Cache";
import * as CalcUtility from "@/utils/CalcUtility";
import {
  expandNumberAbbreviationTerms,
  nanStringToEmptyString,
  evaluateNumbers,
} from "@/components/Commons";
import classNames from "classnames";
import { DateInput, IDateFormatProps } from "@blueprintjs/datetime";

type LocalQueryJournals = {
  journals: Journal[];
};

type LocalQueryTrades = {
  activeTrades: Trade[];
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
  height: 80vh;
`;

const RightTextAlignContanier = styled.div`
  text-align: right;
`;

const LoadingCell = styled.div`
  margin: auto;
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
        const lastPrice = 9.5;
        const totalCost = row.avgBuyPrice * row.shares;
        const marketValue = lastPrice * row.shares;
        const changePL = CalcUtility.computeChange(marketValue, totalCost);
        const changePercPL = CalcUtility.computeChangePercentage(
          lastPrice,
          row.avgBuyPrice,
        );

        if (columnIndex == 0) rowData[column.dataKey] = symbols[parseInt(row.stockId)];
        if (columnIndex == 1) rowData[column.dataKey] = row.type;
        if (columnIndex == 2) rowData[column.dataKey] = row.avgBuyPrice.toFixed(2);
        if (columnIndex == 3) rowData[column.dataKey] = lastPrice.toFixed(2);
        if (columnIndex == 4) rowData[column.dataKey] = row.shares;
        if (columnIndex == 5) rowData[column.dataKey] = totalCost.toFixed(2);
        if (columnIndex == 6) rowData[column.dataKey] = marketValue.toFixed(2);
        if (columnIndex == 7) rowData[column.dataKey] = changePL.toFixed(2);
        if (columnIndex == 8) rowData[column.dataKey] = changePercPL.toFixed(2);

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
};

type FormInputs = {
  commissionRate: number;
  shares: number;
  buyPrice: number;
  sellPrice: number;
};

const rowRenderer = ({ isScrolling, cells }: RowRendererParams) => {
  if (isScrolling) return <LoadingCell>Loading</LoadingCell>;

  return cells;
};

const momentFormatter = (format: string): IDateFormatProps => {
  return {
    formatDate: (date) => moment(date).format(format),
    parseDate: (str) => moment(str, format).toDate(),
    placeholder: `${format} (moment)`,
  };
};

const JournalTable = ({ journalId }: JournalTableProps) => {
  const internalSymbols = useReactiveVar(internalSymbolsVar);
  const [formValues, setFormValues] = useState({
    journalId: "",
    stockId: "",
    action: "",
    grossPrice: "",
    shares: "",
    grossAmount: "",
    fees: "",
    netAmount: "",
    transactionDate: "",
    remarks: "",
  });
  const [addTradeDialogIsOpen, setAddTradeDialogIsOpen] = useState(false);
  const { register, handleSubmit, errors } = useForm<FormInputs>();
  const { loading, error, data } = useQuery(QueryTradesActive, {
    variables: { id: journalId },
  });

  if (error) return <div>Error!</div>;
  if (loading) return <SpinnerLoadExpanded />;

  const { activeTrades } = data as LocalQueryTrades;
  const items = generateData(columns, activeTrades, internalSymbols);

  const handleAddTradeDialogOpen = () => setAddTradeDialogIsOpen(true);
  const handleAddTradeDialogClose = () => setAddTradeDialogIsOpen(false);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    handleConfirm(e.target.name, e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const targetElement = e.target as HTMLInputElement;
      handleConfirm(targetElement.name, targetElement.value);
    }
  };

  const handleConfirm = (name: string, value: string) => {
    let result = value;

    result = expandNumberAbbreviationTerms(result);
    result = evaluateNumbers(result);
    result = nanStringToEmptyString(result);

    setFormValues({ ...formValues, [name]: result });
  };

  const handleValueChange = (
    _valueAsNumber: number,
    valueAsString: string,
    inputElement: HTMLInputElement,
  ) => {
    setFormValues({ ...formValues, [inputElement.name]: valueAsString });
  };

  const onSubmit = (data: FormInputs) => {
    setFormValues({
      ...formValues,
      journalId: "",
      grossAmount: "",
      fees: "",
      netAmount: "",
      remarks: "",
    });
  };

  const tradeActions = ["BUY", "SELL", "STOCK DIV", "IPO"];
  const additionalDateProps = momentFormatter("YYYY-MM-DD");

  return (
    <section>
      <Card>Hello</Card>
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={Classes.DIALOG_BODY}>
              <FormGroup label="Date" labelInfo="(required)">
                <DateInput
                  {...additionalDateProps}
                  closeOnSelection={true}
                  fill={true}
                  shortcuts={true}
                  reverseMonthAndYearMenus={true}
                  defaultValue={new Date()}
                  popoverProps={{ position: Position.BOTTOM }}
                />
              </FormGroup>
              <FormGroup label="Stock" labelFor="input-stock-id" labelInfo="(required)">
                <HTMLSelect
                  id="input-stock-id"
                  options={internalSymbols}
                  fill={true}
                  name="stockId"
                />
              </FormGroup>
              <FormGroup label="Action" labelFor="input-action" labelInfo="(required)">
                <HTMLSelect
                  id="input-action"
                  options={tradeActions}
                  fill={true}
                  name="action"
                />
              </FormGroup>
              <FormGroup
                label="Price"
                labelFor="input-gross-price"
                labelInfo="(required)"
              >
                <NumericInput
                  id="input-gross-price"
                  fill={true}
                  allowNumericCharactersOnly={true}
                  onValueChange={handleValueChange}
                  buttonPosition="none"
                  placeholder="Enter the price..."
                  minorStepSize={0.00001}
                  leftIcon={IconNames.DOLLAR}
                  value={formValues.grossPrice}
                  name="grossPrice"
                  inputRef={register({ required: true })}
                />
              </FormGroup>
              <FormGroup label="Shares" labelFor="input-shares" labelInfo="(required)">
                <NumericInput
                  id="input-shares"
                  fill={true}
                  allowNumericCharactersOnly={false}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  onValueChange={handleValueChange}
                  buttonPosition="none"
                  placeholder="Enter the number of shares..."
                  minorStepSize={0.00001}
                  value={formValues.shares}
                  name="shares"
                  inputRef={register({ required: true })}
                />
              </FormGroup>
              <FormGroup
                label="Total Fees"
                helperText="The fee used when selling a common stock."
              >
                <ControlGroup fill={true}>
                  <div className={classNames(Classes.INPUT_GROUP)}>
                    <Icon icon={IconNames.DOLLAR} />
                    <RightTextAlignContanier
                      className={classNames(Classes.INPUT, Classes.DISABLED)}
                    >
                      {formValues.fees}
                    </RightTextAlignContanier>
                  </div>
                </ControlGroup>
              </FormGroup>
              <FormGroup label="Total Net Amount" helperText="The amount to be earned.">
                <ControlGroup fill={true}>
                  <div className={classNames(Classes.INPUT_GROUP)}>
                    <Icon icon={IconNames.DOLLAR} />
                    <RightTextAlignContanier
                      className={classNames(Classes.INPUT, Classes.DISABLED)}
                    >
                      {formValues.netAmount}
                    </RightTextAlignContanier>
                  </div>
                </ControlGroup>
              </FormGroup>
            </div>
            <div className={Classes.DIALOG_FOOTER}>
              <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button type="submit">Submit</Button>
              </div>
            </div>
          </form>
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

export const AppJournal = () => {
  const { loading, error, data } = useQuery(QueryJournals);

  if (error) return <div>Error!</div>;
  if (loading) return <SpinnerLoadExpanded />;

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
        <Tabs.Expander />
        <Button outlined={true} fill={true} icon={IconNames.ADD} intent={Intent.PRIMARY}>
          New Journal
        </Button>
      </Tabs>
    </CustomMain>
  );
};
