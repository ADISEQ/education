

export function formatMoney(amountGrosze: number): string {
    return (amountGrosze / 100).toFixed(2) +" zł";
}