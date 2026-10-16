import { useState } from "react";
import type { Transaction } from "../models/transaction";
import { formatMoney } from "../utils/formatMoney";
import Chip from "../components/ui/Chip";


const initialTransactions: Transaction[] = [
  {
    id: 1,
    description: "Zakupy",
    amountGrosze: 12500,
    type: "expense",
    categoryId: 1,
    date: "2026-01-01",
  },
  {
    id: 2,
    description: "Paliwo",
    amountGrosze: 20000,
    type: "expense",
    categoryId: 1,
    date: "2026-01-02",
  },
  {
    id: 3,
    description: "Kawa",
    amountGrosze: 1800,
    type: "expense",
    categoryId: 1,
    date: "2026-01-03",
  },
];

export default function TransactionList() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = initialTransactions.filter((t) =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalAmount = filteredTransactions.reduce(
    (acc, t) => acc + t.amountGrosze,
    0,
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold tracking-tight text-text">
            Lista transakcji
          </p>
          <p className="mt-1 text-sm text-text/50">
            Wyszukaj po opisie i zobacz sumę widocznych pozycji
          </p>
        </div>
        
        <Chip type="primary">
          {filteredTransactions.length} pozycji
        </Chip>
        
      </div>

      <input
        type="text"
        aria-label="Wyszukaj transakcję"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Wyszukaj transakcję"
        className="mb-4 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-shadow placeholder:text-text/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <ul className="divide-y divide-border">
          {filteredTransactions.length === 0 ? (
            <li className="px-5 py-12 text-center text-sm text-text/50">
              Brak wyników
            </li>
          ) : (
            filteredTransactions.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-text">{t.description}</p>
                  <p className="mt-0.5 text-xs text-text/45">{t.date}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-text">
                  {formatMoney(t.amountGrosze)}
                </p>
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center justify-between border-t border-border bg-background/70 px-5 py-4">
          <h3 className="text-sm font-medium text-text/60">Suma :</h3>
          <p className="text-base font-semibold tabular-nums text-text">
            {formatMoney(totalAmount)}
          </p>
        </div>
      </div>
    </div>
  );
}
