export function formatNumber( num : Number) {
    return `$${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',')}`
}

export function formatPercentage(num : number) {
    let formatted = num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',')
    return `(${num >= 0 ? `+${formatted}` : formatted }%)`
}