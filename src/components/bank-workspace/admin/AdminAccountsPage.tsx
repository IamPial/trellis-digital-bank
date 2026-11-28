"use client";

import { useState } from "react";
import Panel from "@/components/shared/Panel";
import SimpleModal from "@/components/shared/SimpleModal";
import type { CustomerRow, CustomerTableProps, Notice } from "@/components/shared/types";

type AdminAccountsPageProps = Pick<CustomerTableProps, "freeze" | "setFreeze"> & {
  customers: CustomerRow[];
  setNotice: Notice;
};

export default function AdminAccountsPage({
  customers,
  freeze,
  setFreeze,
  setNotice,
}: AdminAccountsPageProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-3">
        <input placeholder="Search account number" className="h-11 w-full max-w-sm rounded-lg border bg-white px-3 text-sm" />
        <button onClick={() => setCreateOpen(true)} className="h-11 rounded-lg bg-[#176b50] px-4 text-sm font-semibold text-white">Create account</button>
      </div>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-175 text-sm">
            <thead><tr className="text-left text-xs text-[#929b96]"><th className="pb-3">Account</th><th>Customer</th><th>Type</th><th>Balance</th><th>Status</th><th /></tr></thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t">
                  <td className="py-3.5 font-semibold">•••• {customer.account}</td><td>{customer.name}</td><td>{customer.type}</td>
                  <td className="font-semibold">${customer.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td><span className="rounded-full bg-[#edf7f3] px-2 py-1 text-xs text-[#277d62]">{freeze[customer.id] ? "Frozen" : "Active"}</span></td>
                  <td><button onClick={() => setFreeze((value) => ({ ...value, [customer.id]: !value[customer.id] }))} className="text-xs font-semibold text-[#277d62]">{freeze[customer.id] ? "Unfreeze" : "Freeze"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      {createOpen && (
        <SimpleModal title="Create bank account" onClose={() => setCreateOpen(false)}>
          <form onSubmit={(event) => { event.preventDefault(); setCreateOpen(false); setNotice("Bank account created successfully."); }} className="mt-5 space-y-4">
            <input required placeholder="Customer name" className="h-12 w-full rounded-lg border px-3" />
            <select className="h-12 w-full rounded-lg border px-3"><option>Savings Account</option><option>Current Account</option><option>Business Account</option></select>
            <input required type="number" placeholder="Initial deposit" className="h-12 w-full rounded-lg border px-3" />
            <button className="h-12 w-full rounded-lg bg-[#176b50] text-sm font-semibold text-white">Create account</button>
          </form>
        </SimpleModal>
      )}
    </div>
  );
}
