export const formatNumber = (num: number, decimals: number = 2): string => {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(decimals)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(decimals)}K`;
  }
  return num.toFixed(decimals);
};

export const formatCurrency = (num: number, decimals: number = 2): string => {
  return `$${formatNumber(num, decimals)}`;
};

export const formatPercentage = (num: number, decimals: number = 0): string => {
  return `${num.toFixed(decimals)}%`;
};
