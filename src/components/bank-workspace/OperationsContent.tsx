"use client";

import { useEffect, useState } from "react";
import {
  CircleDollarSign,
  Landmark,
  UserRoundPlus,
  Users,
  WalletCards,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppSelector } from "@/store/hooks";
import Card from "@/components/shared/Card";
import CustomerTable from "@/components/shared/CustomerTable";
import Panel from "@/components/shared/Panel";
import SimpleModal from "@/components/shared/SimpleModal";
import type { CustomerRow, Notice } from "@/components/shared/types";

type OperationsContentProps = {
  role: "admin" | "staff";
  section: string;
  setNotice: Notice;
};

type LoanRow = {
  id: string;
  customer: string;
  amount: string;
  type: string;
  status: string;
};

type LoanResponse = {
  id: string;
  customer?: { fullName: string };
  loanType: string;
  requestedAmount: string | number;
  status: string;
};

type CustomerResponse = {
  id: string;
  fullName: string;
  email: string;
  status: string;
  accounts: { accountNumber: string; accountType: string; balance: number | string }[];
};

const activity = [
  { name: "Jun", income: 5200, spending: 3100 },
  { name: "Jul", income: 6100, spending: 3900 },
  { name: "Aug", income: 5800, spending: 3400 },
  { name: "Sep", income: 7200, spending: 4100 },
  { name: "Oct", income: 6800, spending: 3700 },
  { name: "Nov", income: 8400, spending: 4300 },
];

const customersSeed: CustomerRow[] = [
  { id: "CUS-1042", name: "Jamie Parker", email: "jamie@trellis.bank", account: "4821", type: "Savings", status: "Active", balance: 24680.45 },
  { id: "CUS-1048", name: "Sophia Carter", email: "sophia@trellis.bank", account: "1098", type: "Current", status: "Active", balance: 18240.2 },
  { id: "CUS-1054", name: "Marcus Chen", email: "marcus@trellis.bank", account: "7734", type: "Business", status: "Review", balance: 5420.1 },
];

export default function OperationsContent({ role, section, setNotice }: OperationsContentProps) {
  const transactions = useAppSelector((state) => state.transactions.items);
  const [customers, setCustomers] = useState(customersSeed);
  const [query, setQuery] = useState("");
  const [loanRows, setLoanRows] = useState<LoanRow[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [freeze, setFreeze] = useState<Record<string, boolean>>({});

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.email} ${customer.account}`.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    fetch("/api/banking/customers")
      .then(async (response) => response.ok
        ? (await response.json()) as { customers: CustomerResponse[] }
        : null)
      .then((data) => {
        if (!data?.customers) return;
        setCustomers(data.customers.map((customer, index) => {
          const account = customer.accounts[0];
          return {
            id: customer.id,
            name: customer.fullName,
            email: customer.email,
            account: account?.accountNumber.slice(-4) || String(index + 1000),
            type: account?.accountType
              ? `${account.accountType.charAt(0).toUpperCase()}${account.accountType.slice(1)}`
              : "Savings",
            status: customer.status === "active" ? "Active" : "Review",
            balance: Number(account?.balance || 0),
          };
        }));
      })
      .catch(() => undefined);

    if (section !== "loan-review" && section !== "loan-management") return;
    fetch("/api/banking/loans")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load loan applications");
        return response.json() as Promise<{ loans: LoanResponse[] }>;
      })
      .then(({ loans }) => setLoanRows(loans.map((loan) => ({
        id: loan.id,
        customer: loan.customer?.fullName || "Customer",
        amount: `$${Number(loan.requestedAmount).toLocaleString()}`,
        type: loan.loanType,
        status: loan.status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
      }))))
      .catch(() => setNotice("Unable to load loan applications.", "error"));
  }, [section, setNotice]);

  const updateLoan = async (id: string, status: "Approved" | "Rejected" | "Under Review") => {
    const response = await fetch(`/api/banking/loans/${id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status === "Under Review" ? "under_review" : status.toLowerCase() }),
    });
    const result = await response.json();
    if (!response.ok) {
      setNotice(result.error || "Unable to update loan application.", "error");
      return;
    }
    setLoanRows((rows) => rows.map((row) => row.id === id ? { ...row, status } : row));
    setNotice(role === "staff" ? "Application forwarded to the admin for approval." : `Loan application ${status.toLowerCase()}.`);
  };

  if (section === "overview") {
    return (
      <div>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card title="Registered customers" value="2,842" change="+8.4% this month" icon={Users} />
          <Card title="Total bank accounts" value="4,617" change="+6.1% this month" icon={WalletCards} />
          <Card title="Total bank balance" value="$12.4M" change="+4.8% this month" icon={CircleDollarSign} />
          <Card title={role === "admin" ? "Pending loans" : "Pending requests"} value={role === "admin" ? "18" : "12"} change="Review required" icon={Landmark} />
        </section>
        {role === "admin" && (
          <Panel title="Monthly banking activity" className="mt-5">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activity}>
                  <defs>
                    <linearGradient id="adminActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#277d62" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#277d62" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="income" stroke="#277d62" strokeWidth={2} fill="url(#adminActivity)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}
        <Panel title={role === "staff" ? "Customer operations" : "Recent customers"} className="mt-5">
          <CustomerTable customers={customers} freeze={freeze} setFreeze={setFreeze} staff={role === "staff"} />
        </Panel>
      </div>
    );
  }

  if (section === "customers") {
    return (
      <div>
        <div className="mb-5 flex flex-wrap gap-3">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, or account" className="h-11 w-full max-w-sm rounded-lg border bg-white px-3 text-sm" />
          {role === "staff" && (
            <button onClick={() => setCreateOpen(true)} className="flex h-11 items-center gap-2 rounded-lg bg-[#176b50] px-4 text-sm font-semibold text-white">
              <UserRoundPlus size={16} />Register customer
            </button>
          )}
          {role === "admin" && (
            <button onClick={() => setCreateOpen(true)} className="flex h-11 items-center gap-2 rounded-lg bg-[#176b50] px-4 text-sm font-semibold text-white">
              <UserRoundPlus size={16} />Create account
            </button>
          )}
        </div>
        <Panel><CustomerTable customers={filteredCustomers} freeze={freeze} setFreeze={setFreeze} staff={role === "staff"} /></Panel>
        {createOpen && (
          <SimpleModal title={role === "staff" ? "Register customer" : "Create bank account"} onClose={() => setCreateOpen(false)}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setCreateOpen(false);
                setNotice(role === "staff" ? "Customer registered successfully." : "Bank account created successfully.");
              }}
              className="mt-5 space-y-4"
            >
              {role === "staff" && (
                <>
                  <input required placeholder="Full name" className="h-12 w-full rounded-lg border px-3" />
                  <input required type="email" placeholder="Email address" className="h-12 w-full rounded-lg border px-3" />
                </>
              )}
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

  if (section === "accounts") {
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

  if (section === "transactions" || section === "pending-requests") {
    return (
      <div>
        <div className="mb-4 flex gap-3">
          <input placeholder="Search transaction ID" className="h-11 w-full max-w-sm rounded-lg border bg-white px-3 text-sm" />
          <select className="h-11 rounded-lg border bg-white px-3 text-sm"><option>All types</option><option>Deposit</option><option>Withdrawal</option></select>
        </div>
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full min-w-175 text-sm">
              <thead><tr className="text-left text-xs text-[#929b96]"><th className="pb-3">Transaction</th><th>Description</th><th>Amount</th><th>Status</th><th>Date</th><th /></tr></thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t">
                    <td className="py-3.5 font-semibold">{transaction.id}</td><td>{transaction.name}</td>
                    <td className="font-semibold">${Math.abs(transaction.amount).toLocaleString()}</td>
                    <td><span className="rounded-full bg-[#edf7f3] px-2 py-1 text-xs text-[#277d62]">{transaction.status}</span></td>
                    <td>{transaction.date}</td>
                    <td>{role === "staff" && <button onClick={() => setNotice("Transaction flagged for admin review.")} className="text-xs font-semibold text-[#b06e30]">Flag</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    );
  }

  if (section === "loan-review" || section === "loan-management") {
    return (
      <Panel title="Loan applications">
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-sm">
            <thead><tr className="text-left text-xs text-[#929b96]"><th className="pb-3">Application</th><th>Customer</th><th>Type</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {loanRows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="py-3.5 font-semibold">{row.id}</td><td>{row.customer}</td><td>{row.type}</td><td className="font-semibold">{row.amount}</td>
                  <td><span className="rounded-full bg-[#fff4df] px-2 py-1 text-xs text-[#a77728]">{row.status}</span></td>
                  <td>
                    {role === "admin" ? (
                      <div className="flex gap-2">
                        <button onClick={() => updateLoan(row.id, "Approved")} className="rounded-lg bg-[#176b50] px-3 py-1.5 text-xs text-white">Approve</button>
                        <button onClick={() => updateLoan(row.id, "Rejected")} className="rounded-lg border px-3 py-1.5 text-xs">Reject</button>
                      </div>
                    ) : (
                      <button onClick={() => updateLoan(row.id, "Under Review")} className="rounded-lg border px-3 py-1.5 text-xs font-semibold">Add note / Forward</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    );
  }

  if (section === "settings") {
    return (
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Transaction limits">
          <form onSubmit={(event) => { event.preventDefault(); setNotice("Bank transaction settings updated."); }} className="space-y-4">
            <label className="block text-sm">Daily transfer limit<input defaultValue="10000" type="number" className="mt-2 h-12 w-full rounded-lg border px-3" /></label>
            <label className="block text-sm">Maximum single transaction<input defaultValue="5000" type="number" className="mt-2 h-12 w-full rounded-lg border px-3" /></label>
            <label className="block text-sm">Minimum account balance<input defaultValue="25" type="number" className="mt-2 h-12 w-full rounded-lg border px-3" /></label>
            <button className="h-12 w-full rounded-lg bg-[#176b50] text-sm font-semibold text-white">Save settings</button>
          </form>
        </Panel>
        <Panel title="Suspicious transaction rules">
          <div className="space-y-3">
            {["Transfers above $5,000", "5 or more transfers per hour", "Login from a new device"].map((rule) => (
              <label key={rule} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <span>{rule}</span><input type="checkbox" defaultChecked className="h-4 w-4 accent-[#176b50]" />
              </label>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  return <Panel title="Customer workspace"><CustomerTable customers={customers} freeze={freeze} setFreeze={setFreeze} staff={role === "staff"} /></Panel>;
}
