"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  CreditCard,
  Send,
} from "lucide-react";
import type { Transaction } from "@/store/store";
import Card from "@/components/shared/Card";
import Panel from "@/components/shared/Panel";
import TransactionsTable from "@/components/shared/TransactionsTable";
import TransferModal from "@/components/shared/TransferModal";
import type { AccountView, CashFlowMonth } from "./types";

type OverviewPageProps = {
  accounts: AccountView[];
  selectedAccount: AccountView["key"];
  transactions: Transaction[];
  cashFlowData: CashFlowMonth[];
  transferOpen: boolean;
  onSelectAccount: (account: AccountView["key"]) => void;
  onOpenTransfer: () => void;
  onCloseTransfer: () => void;
  onSubmitTransfer: React.FormEventHandler<HTMLFormElement>;
};

export default function OverviewPage({
  accounts,
  selectedAccount,
  transactions,
  cashFlowData,
  transferOpen,
  onSelectAccount,
  onOpenTransfer,
  onCloseTransfer,
  onSubmitTransfer,
}: OverviewPageProps) {
  return (
    <div>
      <div className="mb-5 flex justify-end">
        <button onClick={onOpenTransfer} className="flex h-11 items-center gap-2 rounded-lg bg-[#176b50] px-4 text-sm font-semibold text-white">
          <Send size={16} />Transfer money
        </button>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        <Card title="Total balance" value={`$${accounts.reduce((sum, account) => sum + account.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} change={`${accounts.length} active accounts`} icon={CircleDollarSign} />
        <Card title="Monthly deposits" value={`$${transactions.filter((transaction) => transaction.amount > 0).reduce((sum, transaction) => sum + transaction.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} change="Deposit transaction history" icon={ArrowDownLeft} />
        <Card title="Monthly spending" value={`$${transactions.filter((transaction) => transaction.amount < 0).reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} change="Spending transaction history" icon={ArrowUpRight} />
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_.75fr] mb-3">
        <Panel title="Cash flow" subtitle="Monthly income and spending" className="min-w-0">
          <div className="h-70 w-full min-w-0">
            {cashFlowData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                  <defs>
                    <linearGradient id="customerIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2864ea" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#2864ea" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="customerSpending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#46b88a" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="#46b88a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0ee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
                  <Legend />
                  <Area type="monotone" dataKey="income" name="Money in" stroke="#2864ea" strokeWidth={2} fill="url(#customerIncome)" />
                  <Area type="monotone" dataKey="spending" name="Money out" stroke="#46b88a" strokeWidth={2} fill="url(#customerSpending)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-[#929b96]">No transaction data yet.</div>
            )}
          </div>
        </Panel>
        <Panel title="My accounts">
          <div className="space-y-2">
            {accounts.map((account) => (
              <button
                key={account.key}
                onClick={() => onSelectAccount(account.key)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${selectedAccount === account.key ? "border-[#bcdacf] bg-[#f2f8f5]" : "border-[#edf0ee]"}`}
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#edf3f0] text-[#4e7565]"><CreditCard size={18} /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{account.label}</p>
                  <p className="text-xs text-[#929b96]">•••• {account.last}</p>
                </div>
                <p className="text-sm font-semibold">${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </button>
            ))}
          </div>
        </Panel>
      </section>
      <TransactionsTable transactions={transactions} />
      {transferOpen && <TransferModal onClose={onCloseTransfer} onSubmit={onSubmitTransfer} />}
    </div>
  );
}
