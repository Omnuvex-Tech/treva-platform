/**
 * Fixed rates the site prices units with: 1 AZN = 0.59 USD, 1 USD = 0.87 EUR.
 * Shared by the Profitbase sync and the "Sync currencies" action so both
 * derive the same numbers.
 */
export const USD_PER_AZN = 0.59;
export const EUR_PER_USD = 0.87;

const toUsd: Record<string, (amount: number) => number> = {
  USD: (amount) => amount,
  AZN: (amount) => amount * USD_PER_AZN,
  EUR: (amount) => amount / EUR_PER_USD,
};

/**
 * A price in USD, AZN and EUR from the one currency it is quoted in. The
 * quoted amount is kept as is; only the other two are derived. Returns just
 * the quoted price when the currency has no known rate.
 */
export function pricesInAllCurrencies(
  currency: string,
  amount: number,
): Record<string, number> {
  const convert = toUsd[currency];
  if (!convert) return { [currency]: amount };

  const usd = convert(amount);
  return {
    USD: Math.round(usd),
    AZN: Math.round(usd / USD_PER_AZN),
    EUR: Math.round(usd * EUR_PER_USD),
    [currency]: amount,
  };
}
