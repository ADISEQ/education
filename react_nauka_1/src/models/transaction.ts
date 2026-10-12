

export interface Transaction {
    id: number;
    description: string;
    amountGrosze: number;
    type: 'income' | 'expense';
    categoryId: number;
    date: string;
}
