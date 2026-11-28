"use client";

import { useState } from "react";
import { UserRoundPlus } from "lucide-react";
import CustomerTable from "@/components/shared/CustomerTable";
import Panel from "@/components/shared/Panel";
import SimpleModal from "@/components/shared/SimpleModal";
import type { CustomerRow, CustomerTableProps, Notice } from "@/components/shared/types";

type AdminCustomersPageProps = Pick<CustomerTableProps, "freeze" | "setFreeze"> & {
  customers: CustomerRow[];
  setNotice: Notice;
};

export default function AdminCustomersPage({
  customers,
  freeze,
  setFreeze,
  setNotice,
}: AdminCustomersPageProps) {
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.email} ${customer.account}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-3">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, or account" className="h-11 w-full max-w-sm rounded-lg border bg-white px-3 text-sm" />
        <button onClick={() => setCreateOpen(true)} className="flex h-11 items-center gap-2 rounded-lg bg-[#176b50] px-4 text-sm font-semibold text-white">
          <UserRoundPlus size={16} />Create account
        </button>
      </div>
      <Panel><CustomerTable customers={filteredCustomers} freeze={freeze} setFreeze={setFreeze} staff={false} /></Panel>
      {createOpen && (
        <SimpleModal title="Create bank account" onClose={() => setCreateOpen(false)}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setCreateOpen(false);
              setNotice("Bank account created successfully.");
            }}
            className="mt-5 space-y-4"
          >
            <select className="h-12 w-full rounded-lg border px-3">
              <option>Savings Account</option><option>Current Account</option><option>Business Account</option>
            </select>
            <input required placeholder="Initial deposit" type="number" min="0" className="h-12 w-full rounded-lg border px-3" />
            <button className="h-12 w-full rounded-lg bg-[#176b50] text-sm font-semibold text-white">Confirm</button>
          </form>
        </SimpleModal>
      )}
    </div>
  );
}
