export function formatNumber( num : Number) {
    return `$${num.toFixed(2)}`
}

export function formatPercentage(num : number) {
    let formatted = num.toFixed(2)
    return `(${num >= 0 ? `+${formatted}` : formatted }%)`
}