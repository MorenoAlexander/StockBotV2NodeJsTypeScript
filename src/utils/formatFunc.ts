export function formatNumber(num: number) {
  return `$${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function formatPercentage(num: number) {
  const formatted = num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `(${num >= 0 ? `+${formatted}` : formatted}%)`;
}
