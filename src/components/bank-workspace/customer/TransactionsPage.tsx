"use client";

import { SlidersHorizontal } from "lucide-react";
import TransactionsTable from "@/components/shared/TransactionsTable";
import type { Transaction } from "@/store/store";

type TransactionsPageProps = { transactions: Transaction[] };

export default function TransactionsPage({ transactions }: TransactionsPageProps) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <input placeholder="Search transaction ID" className="h-11 w-full max-w-sm rounded-lg border bg-white px-3 text-sm" />
        <select className="h-11 rounded-lg border bg-white px-3 text-sm">
          <option>All types</option><option>Deposit</option><option>Withdrawal</option><option>Fund Transfer</option>
        </select>
        <button className="h-11 rounded-lg border bg-white px-3 text-sm"><SlidersHorizontal className="mr-2 inline" size={15} />Filters</button>
      </div>
      <TransactionsTable transactions={transactions} />
    </div>
  );
}
