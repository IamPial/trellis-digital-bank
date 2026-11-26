"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { TransactionsTableProps } from "./types";

export default function TransactionsTable({ transactions, className = "" }: TransactionsTableProps) {
  return (
    <section className={`rounded-2xl border border-[#edf0ee] bg-white ${className}`}>
      <div className="border-b border-[#edf0ee] px-5 py-4">
        <h2 className="font-semibold">Recent transactions</h2>
        <p className="mt-1 text-xs text-[#929b96]">Latest account activity</p>
      </div>
      <div className="divide-y divide-[#f0f2f1]">
        {transactions.slice(0, 8).map((transaction) => {
          const credit = transaction.amount > 0;
          return (
            <div key={transaction.id} className="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-3.5 md:grid-cols-[1.4fr_1fr_1fr_auto]">
              <div className="flex items-center gap-3">
                <div className={`grid h-9 w-9 place-items-center rounded-full ${credit ? "bg-[#eaf5ef] text-[#277d62]" : "bg-[#f2f3f2] text-[#69746f]"}`}>
                  {credit ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
                </div>
                <div>
                  <p className="text-sm font-semibold">{transaction.name}</p>
                  <p className="text-xs text-[#9aa39e]">{transaction.detail}</p>
                </div>
              </div>
              <p className="hidden text-xs text-[#7d8882] md:block">{transaction.date}</p>
              <p className="hidden text-xs text-[#7d8882] md:block">{transaction.id}</p>
              <div className="text-right">
                <p className={`text-sm font-semibold ${credit ? "text-[#277d62]" : "text-[#26312c]"}`}>
                  {credit ? "+" : "-"}${Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="mt-1 text-[10px] text-[#277d62]">{transaction.status}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
