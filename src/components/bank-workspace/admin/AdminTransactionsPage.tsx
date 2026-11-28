"use client";

import Panel from "@/components/shared/Panel";
import type { Transaction } from "@/store/store";

export default function AdminTransactionsPage({ transactions }: { transactions: Transaction[] }) {
  return (
    <div>
      <div className="mb-4 flex gap-3">
        <input placeholder="Search transaction ID" className="h-11 w-full max-w-sm rounded-lg border bg-white px-3 text-sm" />
        <select className="h-11 rounded-lg border bg-white px-3 text-sm"><option>All types</option><option>Deposit</option><option>Withdrawal</option></select>
      </div>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-175 text-sm">
            <thead><tr className="text-left text-xs text-[#929b96]"><th className="pb-3">Transaction</th><th>Description</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-t">
                  <td className="py-3.5 font-semibold">{transaction.id}</td><td>{transaction.name}</td>
                  <td className="font-semibold">${Math.abs(transaction.amount).toLocaleString()}</td>
                  <td><span className="rounded-full bg-[#edf7f3] px-2 py-1 text-xs text-[#277d62]">{transaction.status}</span></td>
                  <td>{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
