// Prices are stored as { USD, AZN, EUR } in a JSON column, and Postgres
// returns its keys in its own order (AZN first), so "the first price" is not a
// meaningful choice. Show the object's currency, then USD, then whatever there is.
const FALLBACK_ORDER = ["USD", "AZN", "EUR"];

export function primaryPrice(
    prices: Record<string, number> | null | undefined,
    preferredCurrency?: string | null,
): { currency: string; amount: number } | null {
    if (!prices) return null;
    const order = [preferredCurrency, ...FALLBACK_ORDER, ...Object.keys(prices)].filter(Boolean) as string[];
    for (const currency of order) {
        const amount = Number(prices[currency]);
        if (Number.isFinite(amount) && amount > 0) return { currency, amount };
    }
    return null;
}

export function formatPrimaryPrice(
    prices: Record<string, number> | null | undefined,
    preferredCurrency?: string | null,
): string | null {
    const price = primaryPrice(prices, preferredCurrency);
    return price ? `${price.currency} ${Math.round(price.amount).toLocaleString()}` : null;
}
