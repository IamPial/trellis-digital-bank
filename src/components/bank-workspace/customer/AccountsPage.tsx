"use client";

import type { FormEvent } from "react";
import { CreditCard } from "lucide-react";
import SimpleModal from "@/components/shared/SimpleModal";
import type { AccountView } from "./types";

type AccountsPageProps = {
  accounts: AccountView[];
  accountQuery: string;
  requestOpen: boolean;
  onAccountQueryChange: (query: string) => void;
  onOpenRequest: () => void;
  onCloseRequest: () => void;
  onSubmitRequest: (event: FormEvent<HTMLFormElement>) => void;
};

export default function AccountsPage({
  accounts,
  accountQuery,
  requestOpen,
  onAccountQueryChange,
  onOpenRequest,
  onCloseRequest,
  onSubmitRequest,
}: AccountsPageProps) {
  return (
    <div>
      <div className="mb-5 flex gap-3">
        <input value={accountQuery} onChange={(event) => onAccountQueryChange(event.target.value)} placeholder="Search accounts" className="h-11 w-full max-w-sm rounded-lg border border-[#dde4df] bg-white px-3 text-sm outline-none" />
        <button onClick={onOpenRequest} className="h-11 rounded-lg border border-[#dde4df] bg-white px-4 text-sm font-semibold">Request account</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {accounts.filter((account) => account.label.toLowerCase().includes(accountQuery.toLowerCase())).map((account) => (
          <div key={account.key} className="rounded-2xl border border-[#edf0ee] bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#edf5f1] text-[#277d62]"><CreditCard size={20} /></div>
              <span className="rounded-full bg-[#edf7f3] px-2 py-1 text-xs text-[#277d62]">{account.status}</span>
            </div>
            <h3 className="mt-5 font-semibold">{account.label} Account</h3>
            <p className="mt-1 text-xs text-[#929b96]">{account.type} •••• {account.last}</p>
            <p className="mt-5 text-2xl font-semibold">${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <div className="mt-4 flex justify-between border-t border-[#edf0ee] pt-4 text-xs text-[#7d8882]">
              <span>Available</span><span>{account.limit}</span>
            </div>
          </div>
        ))}
      </div>
      {requestOpen && (
        <SimpleModal title="Deposit or withdrawal request" onClose={onCloseRequest}>
          <form onSubmit={onSubmitRequest} className="mt-5 space-y-4">
            <select name="accountId" required className="h-12 w-full rounded-lg border px-3">
              {accounts.map((account) => <option key={account.id} value={account.id}>{account.label} •••• {account.last}</option>)}
            </select>
            <select name="type" className="h-12 w-full rounded-lg border px-3">
              <option value="deposit">Deposit</option><option value="withdrawal">Withdrawal</option>
            </select>
            <input name="amount" required type="number" min="0.01" step="0.01" placeholder="Amount" className="h-12 w-full rounded-lg border px-3" />
            <textarea name="description" required placeholder="Request description" className="h-24 w-full rounded-lg border px-3 py-3" />
            <button className="h-12 w-full rounded-lg bg-[#176b50] text-sm font-semibold text-white">Submit request</button>
          </form>
        </SimpleModal>
      )}
    </div>
  );
}
