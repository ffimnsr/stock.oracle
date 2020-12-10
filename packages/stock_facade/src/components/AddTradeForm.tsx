import React, { useState } from "react";
import moment from "moment";
import _ from "lodash";
import { useMutation, useReactiveVar } from "@apollo/client";
import {
  Button,
  Classes,
  ControlGroup,
  FormGroup,
  HTMLSelect,
  Icon,
  Intent,
  NumericInput,
  Position,
  Toaster,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import M from "@/operations/mutations";
import { internalSymbolsVar } from "@/Cache";
import * as CalcUtility from "@/utils/CalcUtility";
import {
  DEFAULT_DATE_FORMAT,
  expandNumberAbbreviationTerms,
  nanStringToEmptyString,
  evaluateNumbers,
  JournalCommonProps,
} from "@/components/Commons";
import classNames from "classnames";
import { DateInput, IDateFormatProps } from "@blueprintjs/datetime";

type AddTradeFormInputs = {
  commissionRate: number;
  shares: number;
  buyPrice: number;
  sellPrice: number;
};

type AddTradeFormState = {
  journalId: string;
  stockId: string;
  action: string;
  grossPrice: string;
  shares: string;
  grossAmount: string;
  fees: string;
  netAmount: string;
  transactionDate: number;
  remarks: string;
};

type DialogCloseHandleProps = {
  closeCb: () => void;
};

const RightTextAlignContanier = styled.div`
  text-align: right;
`;

const momentFormatter = (format: string): IDateFormatProps => {
  return {
    formatDate: (date) => moment(date).format(format),
    parseDate: (str) => moment(str, format).toDate(),
    placeholder: `${format} (moment)`,
  };
};

const AddTradeSuccessToaster = Toaster.create({
  position: Position.TOP,
});

export const AddTradeForm = ({
  journalId,
  closeCb,
}: JournalCommonProps & DialogCloseHandleProps) => {
  const [addTradeTransaction] = useMutation(M.MutationAddTradeTransaction);
  const internalSymbols = useReactiveVar(internalSymbolsVar);
  const [formValues, setFormValues] = useState<AddTradeFormState>({
    journalId: journalId,
    stockId: "0",
    action: "BUY",
    grossPrice: "",
    shares: "",
    grossAmount: "",
    fees: "",
    netAmount: "",
    transactionDate: moment().unix() * 1000,
    remarks: "",
  });

  const { register, handleSubmit } = useForm<AddTradeFormInputs>();

  const calculateForm = () => {
    if (formValues.grossPrice !== "" && formValues.shares !== "") {
      const grossPrice = parseFloat(formValues.grossPrice);
      const shares = parseFloat(formValues.shares);
      const grossAmount = grossPrice * shares;
      const fees = CalcUtility.computeBuyFees(grossPrice, shares);
      const netAmount = grossAmount + fees;
      setFormValues({
        ...formValues,
        grossAmount: grossAmount.toFixed(2),
        fees: fees.toFixed(2),
        netAmount: netAmount.toFixed(2),
        remarks: "",
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const targetElement = e.target as HTMLInputElement;
    if (targetElement.name === "shares")
      handleConfirmShares(targetElement.name, targetElement.value);
    else calculateForm();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const targetElement = e.target as HTMLInputElement;
      if (targetElement.name === "shares")
        handleConfirmShares(targetElement.name, targetElement.value);
      else calculateForm();
    }
  };

  const handleConfirmShares = (name: string, value: string) => {
    let result = value;

    result = expandNumberAbbreviationTerms(result);
    result = evaluateNumbers(result);
    result = nanStringToEmptyString(result);

    if (formValues.grossPrice !== "") {
      const grossPrice = parseFloat(formValues.grossPrice);
      const shares = parseFloat(result);
      const grossAmount = grossPrice * shares;
      const fees = CalcUtility.computeBuyFees(grossPrice, shares);
      const netAmount = grossAmount + fees;
      setFormValues({
        ...formValues,
        [name]: result,
        grossAmount: grossAmount.toFixed(2),
        fees: fees.toFixed(2),
        netAmount: netAmount.toFixed(2),
        remarks: "",
      });
    } else {
      setFormValues({ ...formValues, [name]: result });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleValueChange = (
    _valueAsNumber: number,
    valueAsString: string,
    inputElement: HTMLInputElement,
  ) => {
    setFormValues({ ...formValues, [inputElement.name]: valueAsString });
  };

  const handleDateValueChange = (selectedDate: Date) => {
    setFormValues({ ...formValues, transactionDate: moment(selectedDate).unix() * 1000 });
  };

  const showSuccessToast = () => {
    AddTradeSuccessToaster.show({
      intent: Intent.SUCCESS,
      message: "Successfully added new trade transaction!",
    });
  };

  const onSubmit = async () => {
    calculateForm();
    await addTradeTransaction({
      variables: {
        input: {
          journalId: formValues.journalId,
          stockId: formValues.stockId,
          action: formValues.action,
          grossPrice: parseFloat(formValues.grossPrice),
          shares: parseFloat(formValues.shares),
          grossAmount: parseFloat(formValues.grossAmount),
          fees: parseFloat(formValues.fees),
          netAmount: parseFloat(formValues.netAmount),
          transactionDate: formValues.transactionDate,
          remarks: formValues.remarks,
        },
      },
    });

    closeCb();
    showSuccessToast();
  };

  const tradeActions = ["BUY", "SELL", "STOCK DIV", "IPO"];
  const optionsStocks = internalSymbols.map((x, index) => ({
    label: x,
    value: index,
  }));
  const additionalDateProps = momentFormatter(DEFAULT_DATE_FORMAT);

  return (
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
            placeholder={DEFAULT_DATE_FORMAT}
            onChange={handleDateValueChange}
          />
        </FormGroup>
        <FormGroup label="Stock" labelFor="input-stock-id" labelInfo="(required)">
          <HTMLSelect
            id="input-stock-id"
            options={optionsStocks}
            fill={true}
            name="stockId"
            onChange={handleChange}
            elementRef={register({ required: true })}
          />
        </FormGroup>
        <FormGroup label="Action" labelFor="input-action" labelInfo="(required)">
          <HTMLSelect
            id="input-action"
            options={tradeActions}
            fill={true}
            name="action"
            onChange={handleChange}
            elementRef={register({ required: true })}
          />
        </FormGroup>
        <FormGroup label="Price" labelFor="input-gross-price" labelInfo="(required)">
          <NumericInput
            id="input-gross-price"
            fill={true}
            allowNumericCharactersOnly={true}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
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
          label="Total Gross Amount"
          helperText="The amount without the fee added."
        >
          <ControlGroup fill={true}>
            <div className={classNames(Classes.INPUT_GROUP)}>
              <Icon icon={IconNames.DOLLAR} />
              <RightTextAlignContanier
                className={classNames(Classes.INPUT, Classes.DISABLED)}
              >
                {formValues.grossAmount}
              </RightTextAlignContanier>
            </div>
          </ControlGroup>
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
  );
};
