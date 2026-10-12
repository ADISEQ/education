export function isValidAmount(amountGrosze: number): boolean {
    return (
        Number.isInteger(amountGrosze) &&
        amountGrosze >= 1 &&
        amountGrosze <= 100000000
    )

}

export function isValidDate(date: string): boolean {
    return (
        date.match(/^\d{4}-\d{2}-\d{2}$/) !== null
    )

}

