export enum FormatMoneyVariant {
  USD = "USD",
  TOKEN = "TOKEN",
}

const FRACTION_MAP: Record<FormatMoneyVariant, number> = {
  [FormatMoneyVariant.TOKEN]: 4,
  [FormatMoneyVariant.USD]: 2,
};

export const formatMoney = (
  money: number,
  variant: FormatMoneyVariant = FormatMoneyVariant.USD,
): string => {
  const result = money.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: FRACTION_MAP[variant],
  });

  return result;
};
