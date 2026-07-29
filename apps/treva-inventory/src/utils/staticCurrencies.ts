export const STATIC_CURRENCIES = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "AZN", label: "AZN" },
] as const;

export type StaticCurrencyValue = (typeof STATIC_CURRENCIES)[number]["value"];
