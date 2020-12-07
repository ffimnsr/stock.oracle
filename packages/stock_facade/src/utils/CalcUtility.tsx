export function getPriceDecimalPlace(price: string): number {
  var round2 = parseFloat(price).toFixed(2);
  if (price != round2) {
    return 4;
  } else {
    return 2;
  }
}

export function computeChange(currentPrice: number, closePrice: number): number {
  return currentPrice - closePrice;
}

export function computeChangePercentage(currentPrice: number, closePrice: number): number {
  if (closePrice == 0) {
    return 0;
  }

  var change = computeChange(currentPrice, closePrice);
  return (change / closePrice) * 100;
}

export function computeStockWorth(price: number, shares: number): number {
  return price * shares;
}

export function computeExactBreakEvenSellPrice(
  shares: number,
  totalCost: number,
  brokerCommissionRate?: number,
): number {
  if (!brokerCommissionRate) brokerCommissionRate = 0.0025;
  if (!shares || shares <= 0) {
    return 0;
  }
  return totalCost / (0.99485 - 1.12 * brokerCommissionRate) / shares;
}

export function computeBreakEvenSellPrice(
  shares: number,
  totalCost: number,
  decimalPlaces: number,
  brokerCommissionRate: number,
): number {
  if (totalCost) {
    var exactBreakEvenSellPrice = computeExactBreakEvenSellPrice(
      shares,
      totalCost,
      brokerCommissionRate,
    );
    var multiplier = 10;
    var balancer = 0;
    if (!decimalPlaces) decimalPlaces = 2;
    for (var i = 1; i < decimalPlaces; i++) {
      multiplier *= 10;
    }
    if (totalCost < 8000) {
      if (decimalPlaces == 2) {
        balancer = 0.02;
      } else {
        balancer = 0.0002;
      }
    }
    return Math.ceil(exactBreakEvenSellPrice * multiplier) / multiplier + balancer;
  } else {
    return 0;
  }
}

export function computePercentageSellPrice(breakEvenPrice: number, percentage: number): number {
  var percentageMultiplier = 1.0 + percentage;
  return breakEvenPrice * percentageMultiplier;
}

export function computeBuyFees(
  price: number,
  shares: number,
  brokerCommissionRate: number,
): number {
  if (price) {
    var stockWorth = computeStockWorth(price, shares);
    return computeBasicFees(stockWorth, brokerCommissionRate);
  } else {
    return 0;
  }
}

export function computeSellFees(
  price: number,
  shares: number,
  brokerCommissionRate: number,
  year?: number,
) {
  var stockWorth = computeStockWorth(price, shares);
  var salesTax = computeSalesTax(stockWorth, null, year);
  return computeBasicFees(stockWorth, brokerCommissionRate) + salesTax;
}

export function computeBasicFees(stockWorth: number, brokerCommissionRate: number): number {
  var brokerCommission = computeBrokerCommission(stockWorth, brokerCommissionRate);
  var vat = computeVAT(brokerCommission);
  var fees = computePSEFee(stockWorth);
  return brokerCommission + vat + fees;
}

export function computeBrokerCommission(stockWorth: number, brokerCommission?: number): number {
  if (!brokerCommission && brokerCommission != 0) brokerCommission = 0.0025;

  let result = stockWorth * brokerCommission;
  if (result < 20 && brokerCommission != 0) {
    result = 20;
  }
  return result;
}

export function computeVAT(brokerCommission: number, vatAmount?: number): number {
  if (!vatAmount) vatAmount = 0.12;
  return brokerCommission * vatAmount;
}

export function computePSEFee(stockWorth: number, pseFee?: number): number {
  if (!pseFee) pseFee = 0.00015;
  return stockWorth * pseFee;
}

export function computeSalesTax(
  stockWorth: number,
  salesTax?: number | null,
  year?: number,
): number {
  if (!salesTax) salesTax = 0.006;
  if (year) {
    let orderDate = new Date(year, 1, 1);
    let limitDate = new Date(2018, 1, 1);
    if (orderDate < limitDate) salesTax = 0.005;
  }
  return stockWorth * salesTax;
}

export function computeRisk(entryPriceMin: number, cutLossPrice: number): number {
  if (entryPriceMin > 0 && cutLossPrice > 0) {
    return computeChangePercentage(cutLossPrice, entryPriceMin);
  } else {
    return 0.0;
  }
}

export function computeReward(entryPriceMin: number, targetPrice: number): number {
  if (entryPriceMin > 0 && targetPrice > 0) {
    return computeChangePercentage(targetPrice, entryPriceMin);
  } else {
    return 0.0;
  }
}

export function computeRiskRewardRatio(risk: number, reward: number): number {
  if (risk !== 0) {
    return reward / Math.abs(risk);
  } else {
    return 0.0;
  }
}
