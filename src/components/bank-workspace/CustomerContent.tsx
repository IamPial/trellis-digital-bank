"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
  Landmark,
  ReceiptText,
  Send,
  SlidersHorizontal,
} from "lucide-react";
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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addTransaction,
  fetchAccounts,
  fetchLoans,
  fetchTransactions,
  selectAccount,
  type Transaction,
} from "@/store/store";
import Card from "@/components/shared/Card";
import Limit from "@/components/shared/Limit";
import Panel from "@/components/shared/Panel";
import SimpleModal from "@/components/shared/SimpleModal";
import TransactionsTable from "@/components/shared/TransactionsTable";
import TransferModal from "@/components/shared/TransferModal";
import type { Notice } from "@/components/shared/types";

type CustomerContentProps = {
  section: string;
  setNotice: Notice;
};

type AccountView = {
  id: string;
  key: "checking" | "savings" | "business";
  label: string;
  last: string;
  balance: number;
  type: string;
  status: string;
  limit: string;
};

type AccountResponse = {
  id: string;
  accountType: string;
  accountNumber: string;
  balance: number | string;
  status: string;
  dailyLimit: number | string;
};

type CashFlowMonth = { name: string; income: number; spending: number };

function getCashFlowData(transactions: Transaction[]): CashFlowMonth[] {
  const dates = transactions
    .map((transaction) => new Date(transaction.date))
    .filter((date) => !Number.isNaN(date.getTime()));
  if (!dates.length) return [];

  const latest = dates.reduce((current, date) => date > current ? date : current);
  return Array.from({ length: 6 }, (_, index) => {
    const month = new Date(latest.getFullYear(), latest.getMonth() - 5 + index, 1);
    const monthlyTransactions = transactions.filter((transaction) => {
      const date = new Date(transaction.date);
      return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
    });
    return {
      name: month.toLocaleString("en-US", { month: "short" }),
      income: monthlyTransactions
        .filter((transaction) => transaction.amount > 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0),
      spending: monthlyTransactions
        .filter((transaction) => transaction.amount < 0)
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    };
  });
}

export default function CustomerContent({ section, setNotice }: CustomerContentProps) {
  const dispatch = useAppDispatch();
  const transactions = useAppSelector((state) => state.transactions.items);
  const selected = useAppSelector((state) => state.accounts.selected);
  const cashFlowData = getCashFlowData(transactions);
  const [accountQuery, setAccountQuery] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);
  const [loanStatus, setLoanStatus] = useState("Pending");
  const [accounts, setAccounts] = useState<AccountView[]>([
    { id: "", key: "checking", label: "Checking", last: "4821", balance: 24680.45, type: "Savings Account", status: "Active", limit: "$10,000/day" },
    { id: "", key: "savings", label: "Savings", last: "1098", balance: 18240.2, type: "Savings Account", status: "Active", limit: "$5,000/day" },
    { id: "", key: "business", label: "Business", last: "7734", balance: 5420.1, type: "Business Account", status: "Active", limit: "$25,000/day" },
  ]);

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactions());
    dispatch(fetchLoans());
    fetch("/api/banking/accounts")
      .then(async (response) => response.ok
        ? (await response.json()) as { accounts: AccountResponse[] }
        : null)
      .then((data) => {
        if (!data?.accounts) return;
        setAccounts(data.accounts.map((account, index) => {
          const accountType = account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1);
          return {
            id: account.id,
            key: (["checking", "savings", "business"][index] || "business") as AccountView["key"],
            label: accountType,
            last: account.accountNumber.slice(-4),
            balance: Number(account.balance),
            type: `${accountType} Account`,
            status: account.status === "active" ? "Active" : account.status,
            limit: `${Number(account.dailyLimit).toLocaleString()}/day`,
          };
        }));
      })
      .catch(() => undefined);
  }, [dispatch]);

  const submitTransfer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const recipient = String(form.get("recipient") || "");
    const amount = Number(form.get("amount"));
    const pin = String(form.get("pin") || "");
    const description = String(form.get("description") || "");
    const selectedAccount = accounts.find((account) => account.key === selected);
    if (!recipient || !Number.isFinite(amount) || amount <= 0 || !/^\d{4}$/.test(pin)) {
      setNotice("Enter a valid recipient, amount, and 4-digit PIN.", "error");
      return;
    }

    const response = await fetch("/api/banking/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient, amount, pin, description, senderAccountId: selectedAccount?.id }),
    });
    const result = await response.json();
    if (!response.ok) {
      setNotice(result.error || "Transfer failed.", "error");
      return;
    }

    dispatch(addTransaction({
      id: result.transactionId,
      name: `Transfer to ${recipient}`,
      detail: "Fund transfer",
      amount: -amount,
      type: "debit",
      status: "Completed",
      date: "Nov 24, 2026",
    }));
    setTransferOpen(false);
    setNotice(`Transfer completed. Reference: ${result.transactionId}`);
  };

  const submitRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/banking/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId: String(form.get("accountId") || ""),
        type: String(form.get("type") || ""),
        amount: Number(form.get("amount")),
        description: String(form.get("description") || ""),
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setNotice(result.error || "Unable to submit request.", "error");
      return;
    }
    setRequestOpen(false);
    setNotice("Request submitted and is awaiting approval.");
  };

  const submitLoan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/banking/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        loanType: String(form.get("loanType") || "Personal Loan"),
        requestedAmount: Number(form.get("amount")),
        loanDurationMonths: Number(form.get("duration")),
        monthlyIncome: Number(form.get("income")),
        employmentStatus: String(form.get("employment") || "Employed"),
        description: String(form.get("description") || ""),
      }),
    });
    if (!response.ok) {
      setNotice("Loan application could not be submitted.", "error");
      return;
    }
    setLoanOpen(false);
    setLoanStatus("Under Review");
    setNotice("Loan application submitted for review.");
  };

  const downloadStatement = () => {
    const csv = "Transaction ID,Description,Amount,Status,Date\n"
      + transactions.map((transaction) => `${transaction.id},${transaction.name},${transaction.amount},${transaction.status},${transaction.date}`).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "trellis-account-statement.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (section === "overview") {
    return (
      <div>
        <div className="mb-5 flex justify-end">
          <button onClick={() => setTransferOpen(true)} className="flex h-11 items-center gap-2 rounded-lg bg-[#176b50] px-4 text-sm font-semibold text-white">
            <Send size={16} />Transfer money
          </button>
        </div>
        <section className="grid gap-4 md:grid-cols-3">
          <Card title="Total balance" value={`$${accounts.reduce((sum, account) => sum + account.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} change={`${accounts.length} active accounts`} icon={CircleDollarSign} />
          <Card title="Monthly deposits" value={`$${transactions.filter((transaction) => transaction.amount > 0).reduce((sum, transaction) => sum + transaction.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} change="Database transaction history" icon={ArrowDownLeft} />
          <Card title="Monthly spending" value={`$${transactions.filter((transaction) => transaction.amount < 0).reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} change="Database transaction history" icon={ArrowUpRight} />
        </section>
        <section className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_.75fr]">
          <Panel title="Cash flow" subtitle="Monthly income and spending" className="min-w-0">
            <div className="h-[280px] w-full min-w-0">
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
                  onClick={() => dispatch(selectAccount(account.key))}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${selected === account.key ? "border-[#bcdacf] bg-[#f2f8f5]" : "border-[#edf0ee]"}`}
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
        {transferOpen && <TransferModal onClose={() => setTransferOpen(false)} onSubmit={submitTransfer} />}
      </div>
    );
  }

  if (section === "accounts") {
    return (
      <div>
        <div className="mb-5 flex gap-3">
          <input value={accountQuery} onChange={(event) => setAccountQuery(event.target.value)} placeholder="Search accounts" className="h-11 w-full max-w-sm rounded-lg border border-[#dde4df] bg-white px-3 text-sm outline-none" />
          <button onClick={() => setRequestOpen(true)} className="h-11 rounded-lg border border-[#dde4df] bg-white px-4 text-sm font-semibold">Request account</button>
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
          <SimpleModal title="Deposit or withdrawal request" onClose={() => setRequestOpen(false)}>
            <form onSubmit={submitRequest} className="mt-5 space-y-4">
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

  if (section === "transactions") {
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

  if (section === "transfers") {
    return (
      <div className="grid gap-5 lg:grid-cols-[1fr_.65fr]">
        <Panel title="Send money" subtitle="Transfer within Trellis Bank">
          <form onSubmit={submitTransfer} className="space-y-4">
            <label className="block text-sm font-medium">Recipient account number<input name="recipient" required placeholder="TB-4821-1098" className="mt-2 h-12 w-full rounded-lg border px-3" /></label>
            <label className="block text-sm font-medium">Amount<input name="amount" required type="number" min="0.01" step="0.01" placeholder="0.00" className="mt-2 h-12 w-full rounded-lg border px-3" /></label>
            <label className="block text-sm font-medium">Description<input name="description" placeholder="What is this for?" className="mt-2 h-12 w-full rounded-lg border px-3" /></label>
            <label className="block text-sm font-medium">Transaction PIN<input name="pin" required type="password" maxLength={4} placeholder="••••" className="mt-2 h-12 w-full rounded-lg border px-3" /></label>
            <button className="h-12 w-full rounded-lg bg-[#176b50] text-sm font-semibold text-white">Review and send</button>
          </form>
        </Panel>
        <Panel title="Transfer limits">
          <div className="space-y-5">
            <Limit label="Daily transfer limit" used="$1,250" total="$10,000" percent={13} />
            <Limit label="Single transaction" used="$2,500" total="$5,000" percent={50} />
          </div>
        </Panel>
      </div>
    );
  }

  if (section === "loans") {
    return (
      <div>
        <div className="mb-5 flex justify-end"><button onClick={() => setLoanOpen(true)} className="h-11 rounded-lg bg-[#176b50] px-4 text-sm font-semibold text-white">Apply for loan</button></div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Remaining balance" value="$18,450.00" change="Loan ending Jan 2028" icon={Landmark} />
          <Card title="Monthly payment" value="$742.80" change="Next due Dec 01" icon={Clock3} />
          <Card title="Application status" value={loanStatus} change="Personal loan • $24,000" icon={ReceiptText} />
        </div>
        <Panel title="Repayment schedule" className="mt-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead><tr className="text-left text-xs text-[#929b96]"><th className="pb-3">Due date</th><th className="pb-3">Payment</th><th className="pb-3">Principal</th><th className="pb-3">Status</th></tr></thead>
              <tbody>
                {[["Dec 01, 2026", "$742.80", "$412.20", "Upcoming"], ["Nov 01, 2026", "$742.80", "$405.10", "Paid"], ["Oct 01, 2026", "$742.80", "$398.40", "Paid"]].map((row) => (
                  <tr key={row[0]} className="border-t"><td className="py-3">{row[0]}</td><td className="py-3 font-semibold">{row[1]}</td><td className="py-3">{row[2]}</td><td className="py-3"><span className="rounded-full bg-[#edf7f3] px-2 py-1 text-xs text-[#277d62]">{row[3]}</span></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        {loanOpen && (
          <SimpleModal title="Apply for a loan" onClose={() => setLoanOpen(false)}>
            <form onSubmit={submitLoan} className="mt-5 space-y-4">
              <select name="loanType" className="h-12 w-full rounded-lg border px-3">
                <option>Personal Loan</option><option>Home Loan</option><option>Auto Loan</option><option>Business Loan</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input name="amount" required type="number" placeholder="Requested amount" className="h-12 rounded-lg border px-3" />
                <input name="duration" required type="number" placeholder="Duration (months)" className="h-12 rounded-lg border px-3" />
              </div>
              <input name="income" required type="number" placeholder="Monthly income" className="h-12 w-full rounded-lg border px-3" />
              <select name="employment" className="h-12 w-full rounded-lg border px-3"><option>Employed</option><option>Self-employed</option><option>Student</option></select>
              <textarea name="description" required placeholder="Application description" className="h-24 w-full rounded-lg border px-3 py-3" />
              <button className="h-12 w-full rounded-lg bg-[#176b50] text-sm font-semibold text-white">Submit application</button>
            </form>
          </SimpleModal>
        )}
      </div>
    );
  }

  if (section === "statements") {
    return (
      <div>
        <Panel title="Download account statement" subtitle="Choose an account and statement period">
          <div className="grid gap-4 md:grid-cols-3">
            <select className="h-12 rounded-lg border px-3"><option>Checking •••• 4821</option><option>Savings •••• 1098</option></select>
            <select className="h-12 rounded-lg border px-3"><option>November 2026</option><option>October 2026</option><option>September 2026</option></select>
            <button onClick={downloadStatement} className="h-12 rounded-lg bg-[#176b50] px-4 text-sm font-semibold text-white"><Download className="mr-2 inline" size={16} />Download CSV</button>
          </div>
        </Panel>
        <TransactionsTable transactions={transactions} className="mt-5" />
      </div>
    );
  }

  return <TransactionsTable transactions={transactions} />;
}
