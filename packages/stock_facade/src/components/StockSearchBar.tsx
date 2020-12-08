import React, { useState, useEffect } from "react";
import log from "loglevel";
import { useQuery } from "@apollo/client";
import { Button, MenuItem } from "@blueprintjs/core";
import { ItemPredicate, ItemRenderer, Suggest } from "@blueprintjs/select";
import { Stock } from "@/models/Stock";
import { globalStateVar } from "@/Cache";
import QueryStocks from "@/graphqls/QueryStocks.graphql";

const StockSuggest = Suggest.ofType<Stock>();

const filterStock: ItemPredicate<Stock> = (
  query,
  stock,
  _index,
  exactMatch,
) => {
  const normalizedName = stock.name.toLowerCase();
  const normalizedSymbol = stock.symbol.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (exactMatch) {
    return normalizedName === normalizedQuery || normalizedSymbol === normalizedQuery;
  } else {
    return `${normalizedSymbol} - ${normalizedName}`.indexOf(normalizedQuery) >= 0;
  }
};

const renderStock: ItemRenderer<Stock> = (
  stock,
  { handleClick, modifiers, query },
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }

  const text = `${stock.name.toUpperCase()}`;
  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      label={stock.symbol}
      key={stock.id}
      onClick={handleClick}
      text={highlightText(text, query)}
    />
  );
};

const renderInputValue = (stock: Stock) => stock.name;

const areStocksEqual = (a: Stock, b: Stock) => {
  return a.symbol.toLowerCase() === b.symbol.toLowerCase();
};

function escapeRegExpChars(text: string) {
  return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function highlightText(text: string, query: string) {
  let lastIndex = 0;
  const words = query
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map(escapeRegExpChars);
  if (words.length === 0) {
    return [text];
  }
  const regexp = new RegExp(words.join("|"), "gi");
  const tokens: React.ReactNode[] = [];
  while (true) {
    const match = regexp.exec(text);
    if (!match) {
      break;
    }
    const length = match[0].length;
    const before = text.slice(lastIndex, regexp.lastIndex - length);
    if (before.length > 0) {
      tokens.push(before);
    }
    lastIndex = regexp.lastIndex;
    tokens.push(<strong key={lastIndex}>{match[0]}</strong>);
  }
  const rest = text.slice(lastIndex);
  if (rest.length > 0) {
    tokens.push(rest);
  }
  return tokens;
}

export const StockSearchBar = () => {
  const [currentStock, setCurrentStock] = useState<Stock>();
  const { loading, error, data } = useQuery(QueryStocks);

  if (error) return <div>Error!</div>;

  const stocks: Stock[] = loading ? [] : data.stocks;

  return (
    <StockSuggest
      fill={true}
      items={stocks}
      itemPredicate={filterStock}
      itemRenderer={renderStock}
      inputValueRenderer={renderInputValue}
      itemsEqual={areStocksEqual}
      noResults={<MenuItem disabled={true} text="No results." />}
      onItemSelect={(stock: Stock) => {
        globalStateVar({ currentStock: { ...stock } });
        setCurrentStock(stock);
      }}
      popoverProps={{
        minimal: false,
      }}
    >
      <Button
        icon="chart"
        text={
          currentStock
            ? `${currentStock.name} (${currentStock.symbol})`
            : "(No selection)"
        }
        rightIcon="caret-down"
      />
    </StockSuggest>
  );
};
