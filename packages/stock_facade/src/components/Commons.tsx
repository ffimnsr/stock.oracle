import React from "react";
import styled from "styled-components";
import { H5, Spinner } from "@blueprintjs/core";

export type JournalCommonProps = {
  journalId: string;
};

export const CustomMain = styled.main`
  padding: 20px;
`;

export const CustomH5 = styled(H5)`
  margin: 0;
`;

export const HeaderSplitContainer = styled.div`
  display: flex;
  margin: 0 5px;
`;

export const HeaderGroup = styled.div`
  flex: 1;
`;

export const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const SpinnerContainerExpanded = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 92vh;
`;

export const SpinnerLoad = () => (
  <SpinnerContainer>
    <Spinner size={Spinner.SIZE_STANDARD} />
  </SpinnerContainer>
);

export const SpinnerLoadExpanded = () => (
  <SpinnerContainerExpanded>
    <Spinner size={Spinner.SIZE_STANDARD} />
  </SpinnerContainerExpanded>
);

const NumberAbbreviation = {
  BILLION: "b",
  MILLION: "m",
  THOUSAND: "k",
};

const NUMBER_ABBREVIATION_REGEX = /((\.\d+)|(\d+(\.\d+)?))(k|m|b)\b/gi;

export const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";

const roundValue = (value: number, precision: number = 1) => {
  return Math.round(value * 10 ** precision) / 10 ** precision;
};

const expandAbbreviatedNumber = (value: string) => {
  if (!value) return value;

  const num = +value.substring(0, value.length - 1);
  const lastChar = value.charAt(value.length - 1).toLowerCase();

  let result: number = NaN;
  if (lastChar === NumberAbbreviation.THOUSAND) {
    result = num * 1e3;
  } else if (lastChar === NumberAbbreviation.MILLION) {
    result = num * 1e6;
  } else if (lastChar === NumberAbbreviation.BILLION) {
    result = num * 1e9;
  }

  const isValid = !isNaN(result);
  if (isValid) result = roundValue(result);

  return isValid ? result.toString() : "";
};

export const expandNumberAbbreviationTerms = (value: string) => {
  if (!value) return value;

  return value.replace(NUMBER_ABBREVIATION_REGEX, expandAbbreviatedNumber);
};

export const nanStringToEmptyString = (value: string) => {
  return value === "NaN" ? "" : value;
};

export const evaluateNumbers = (value: string) => {
  if (!value) return value;

  const trimmedValue = value.trim();
  const numericValue = +trimmedValue;
  const isValid = !isNaN(numericValue);

  if (!isValid) return "";

  if (numericValue < 0) return "";

  return value;
};

export const currencyFormatOptions = {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
};

export const decimalFormatOptions = {
  style: "decimal",
  minimumFractionDigits: 2,
};

export const percentFormatOptions = {
  style: "percent",
  minimumFractionDigits: 2,
};

export const currencyFormat = (value: number) => {
  return Intl.NumberFormat("en-PH", currencyFormatOptions).format(value);
};

export const decimalFormat = (value: number) => {
  return Intl.NumberFormat("en-PH", decimalFormatOptions).format(value);
};

export const percentFormat = (value: number) => {
  return Intl.NumberFormat("en-PH", percentFormatOptions).format(value);
};

export const sharesFormat = (value: number) => {
  return Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 1,
  }).format(value);
};

export const normalFormat = (value: number) => {
  return Intl.NumberFormat().format(value);
};
