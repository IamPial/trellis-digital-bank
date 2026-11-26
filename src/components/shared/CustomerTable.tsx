"use client";

import type { CustomerTableProps } from "./types";

export default function CustomerTable({ customers, freeze, setFreeze, staff }: CustomerTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-180 text-left text-sm">
        <thead>
          <tr className="text-xs text-[#929b96]">
            <th className="pb-3 font-medium">Customer</th>
            <th className="pb-3 font-medium">Account</th>
            <th className="pb-3 font-medium">Type</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Balance</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="border-t border-[#f0f2f1]">
              <td className="py-3.5">
                <p className="font-semibold">{customer.name}</p>
                <p className="text-xs text-[#929b96]">{customer.email}</p>
              </td>
              <td>•••• {customer.account}</td>
              <td>{customer.type}</td>
              <td>
                <span className={`rounded-full px-2 py-1 text-xs ${customer.status === "Active" ? "bg-[#edf7f3] text-[#277d62]" : "bg-[#fff4df] text-[#a77728]"}`}>
                  {freeze[customer.id] ? "Frozen" : customer.status}
                </span>
              </td>
              <td className="font-semibold">${customer.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td>
                <button
                  onClick={() => setFreeze((value) => ({ ...value, [customer.id]: !value[customer.id] }))}
                  className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                >
                  {freeze[customer.id] ? "Unfreeze" : staff ? "Review" : "Manage"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
