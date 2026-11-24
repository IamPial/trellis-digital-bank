"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft, ArrowUpRight, Bell, Building2, ChevronDown,
  CircleDollarSign, CreditCard, Download, Landmark, LayoutDashboard,
  LifeBuoy, Menu, ReceiptText, Search, Send, Settings,
  SlidersHorizontal, UserRoundPlus, Users, WalletCards, X, Clock3
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addTransaction, clearAuth, selectAccount, setAuth } from "@/store/store";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";

const activity = [
  { name: "Jun", income: 5200, spending: 3100 },
  { name: "Jul", income: 6100, spending: 3900 },
  { name: "Aug", income: 5800, spending: 3400 },
  { name: "Sep", income: 7200, spending: 4100 },
  { name: "Oct", income: 6800, spending: 3700 },
  { name: "Nov", income: 8400, spending: 4300 },
];

const customersSeed = [
  { id: "CUS-1042", name: "Jamie Parker", email: "jamie@trellis.bank", account: "4821", type: "Savings", status: "Active", balance: 24680.45 },
  { id: "CUS-1048", name: "Sophia Carter", email: "sophia@trellis.bank", account: "1098", type: "Current", status: "Active", balance: 18240.2 },
  { id: "CUS-1054", name: "Marcus Chen", email: "marcus@trellis.bank", account: "7734", type: "Business", status: "Review", balance: 5420.1 },
];

type Props = { section?: string };

export default function BankWorkspace({ section = "overview" }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const [mobileNav, setMobileNav] = useState(false);
  const [roleReady, setRoleReady] = useState(false);
  const setNotice = useCallback((message: string, type: "success" | "error" = "success") => {
    toast[type](message);
  }, []);

  useEffect(() => {
    if (auth.role) { setRoleReady(true); return; }
    const cookieRole = document.cookie.split("; ").find((row) => row.startsWith("trellis_role="))?.split("=")[1];
    if (cookieRole === "admin" || cookieRole === "staff" || cookieRole === "customer") {
      const names = { admin: "Alex Morgan", staff: "Jordan Lee", customer: "Jamie Parker" };
      dispatch(setAuth({ role: cookieRole, name: names[cookieRole] }));
    }
    setRoleReady(true);
  }, [auth.role, dispatch]);

  const role = auth.role || "customer";
  const name = auth.name || ({ admin: "Alex Morgan", staff: "Jordan Lee", customer: "Jamie Parker" } as const)[role];
  const normalized = section.toLowerCase().replaceAll("-", " ");
  const nav = role === "customer"
    ? [["Overview","overview",LayoutDashboard],["Accounts","accounts",WalletCards],["Transactions","transactions",ReceiptText],["Transfers","transfers",Send],["Loans","loans",Landmark],["Statements","statements",Download]]
    : role === "staff"
      ? [["Overview","overview",LayoutDashboard],["Customers","customers",Users],["Transactions","transactions",ReceiptText],["Loan Review","loan-review",Landmark],["Pending Requests","pending-requests",Clock3]]
      : [["Overview","overview",LayoutDashboard],["Customers","customers",Users],["Accounts","accounts",WalletCards],["Transactions","transactions",ReceiptText],["Loan Management","loan-management",Landmark],["Settings","settings",Settings]];

  const logout = () => {
    document.cookie = "trellis_role=; path=/; max-age=0";
    document.cookie = "trellis_session=; path=/; max-age=0";
    dispatch(clearAuth());
    router.replace("/login");
  };

  if (!roleReady) return null;

  return (
    <div data-bank-app className="min-h-screen bg-[#f6f8f7] text-[#1b2520]">
      {mobileNav && <button aria-label="Close navigation" onClick={() => setMobileNav(false)} className="fixed inset-0 z-40 bg-black/30 lg:hidden" />}
      <aside className={`fixed left-0 top-0 z-50 h-screen w-[236px] border-r border-[#e7ebe8] bg-white px-4 py-5 transition-transform lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={() => router.push("/dashboard")} className="flex h-10 items-center gap-3 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#176b50] text-white"><Building2 size={19}/></span>
          <span className="text-[17px] font-semibold">Trellis <span className="text-[#7c8680]">Bank</span></span>
        </button>
        <nav className="mt-8 space-y-1">
          {nav.map(([label,key,Icon]) => (
            <button key={String(key)} onClick={() => { router.push(key === "overview" ? "/dashboard" : `/dashboard/${key}`); setMobileNav(false); }} className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm ${section === key || (section === "overview" && key === "overview") ? "bg-[#edf5f1] font-semibold text-[#176b50]" : "text-[#738078] hover:bg-[#f5f7f6]"}`}>
              <Icon size={18} strokeWidth={1.8}/>{String(label)}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-5 left-4 right-4">
          <button className="mb-1 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-[#738078]"><LifeBuoy size={18}/>Help center</button>
          <button onClick={logout} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-[#738078]"><Settings size={18}/>Sign out</button>
        </div>
      </aside>

      <main className="lg:ml-[236px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#edf0ee] bg-white/95 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNav(true)} className="grid h-10 w-10 place-items-center rounded-lg border lg:hidden"><Menu size={20}/></button>
            <div className="hidden h-10 w-[260px] items-center gap-2 rounded-lg bg-[#f4f6f5] px-3 text-[#96a099] md:flex"><Search size={17}/><input aria-label="Search" placeholder="Search customers or transactions" className="w-full bg-transparent text-sm outline-none"/></div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-[#f3f5f4]"><Bell size={19}/><span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#df7258]"/></button>
            <div className="flex items-center gap-2 rounded-lg p-1.5"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#dcebe5] text-sm font-bold text-[#176b50]">{name.split(" ").map((n) => n[0]).join("")}</div><div className="hidden text-left sm:block"><p className="text-xs font-semibold">{name}</p><p className="text-[10px] capitalize text-[#8a958f]">{role}</p></div><ChevronDown size={15}/></div>
          </div>
        </header>

        <div className="mx-auto max-w-[1280px] px-5 py-7 md:px-8">
          <div className="mb-7"><p className="text-sm text-[#8b9690]">Monday, November 24</p><h1 className="mt-1 text-2xl font-semibold capitalize tracking-tight md:text-[28px]">{String(nav.find((item) => item[1] === section)?.[0] || normalized)}</h1></div>
          {role === "customer" ? <CustomerContent section={section} dispatch={dispatch} setNotice={setNotice}/> : <OperationsContent role={role} section={section} dispatch={dispatch} setNotice={setNotice}/>}
        </div>
      </main>
    </div>
  );
}

function Card({ title, value, change, icon: Icon }: { title: string; value: string; change: string; icon: any }) {
  return <div className="min-h-[145px] rounded-2xl border border-[#edf0ee] bg-white p-5"><div className="flex justify-between"><span className="text-sm text-[#7e8983]">{title}</span><div className="grid h-9 w-9 place-items-center rounded-lg bg-[#edf5f1] text-[#277d62]"><Icon size={18}/></div></div><p className="mt-4 text-2xl font-semibold">{value}</p><p className="mt-2 text-xs text-[#277d62]">{change}</p></div>;
}

function CustomerContent({ section, dispatch, setNotice }: { section: string; dispatch: any; setNotice: (value: string, type?: "success" | "error") => void }) {
  const transactions = useAppSelector((state) => state.transactions.items);
  const selected = useAppSelector((state) => state.accounts.selected);
  const [accountQuery, setAccountQuery] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);
  const [loanStatus, setLoanStatus] = useState("Pending");

  const [accounts, setAccounts] = useState([
    { key: "checking", label: "Checking", last: "4821", balance: 24680.45, type: "Savings Account", status: "Active", limit: "$10,000/day" },
    { key: "savings", label: "Savings", last: "1098", balance: 18240.2, type: "Savings Account", status: "Active", limit: "$5,000/day" },
    { key: "business", label: "Business", last: "7734", balance: 5420.1, type: "Business Account", status: "Active", limit: "$25,000/day" },
  ]);

  useEffect(() => {
    fetch("/api/banking/accounts")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!data?.accounts) return;
        setAccounts(data.accounts.map((account: any, index: number) => ({
          key: index === 0 ? "checking" : index === 1 ? "savings" : "business",
          label: account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1),
          last: account.accountNumber.slice(-4),
          balance: Number(account.balance),
          type: `${account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} Account`,
          status: account.status === "active" ? "Active" : account.status,
          limit: `${Number(account.dailyLimit).toLocaleString()}/day`,
        })));
      })
      .catch(() => undefined);
  }, []);

  const submitTransfer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const recipient = String(form.get("recipient"));
    const amount = Number(form.get("amount"));
    const pin = String(form.get("pin"));
    if (!recipient || !Number.isFinite(amount) || amount <= 0 || !/^\d{4}$/.test(pin)) {
      setNotice("Enter a valid recipient, amount, and 4-digit PIN.", "error");
      return;
    }
    const response = await fetch("/api/banking/transfer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipient, amount, pin }) });
    const result = await response.json();
    if (!response.ok) { setNotice(result.error || "Transfer failed.", "error"); return; }
    dispatch(addTransaction({ id: result.transactionId, name: `Transfer to ${recipient}`, detail: "Fund transfer", amount: -amount, type: "debit", status: "Completed", date: "Nov 24, 2026" }));
    setTransferOpen(false);
    setNotice(`Transfer completed. Reference: ${result.transactionId}`);
  };

  const submitRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    const csv = "Transaction ID,Description,Amount,Status,Date\n" + transactions.map((tx) => `${tx.id},${tx.name},${tx.amount},${tx.status},${tx.date}`).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url; link.download = "trellis-account-statement.csv"; link.click(); URL.revokeObjectURL(url);
  };

  if (section === "overview") return (
    <div>
      <div className="mb-5 flex justify-end"><button onClick={() => setTransferOpen(true)} className="flex h-11 items-center gap-2 rounded-lg bg-[#176b50] px-4 text-sm font-semibold text-white"><Send size={16}/>Transfer money</button></div>
      <section className="grid gap-4 md:grid-cols-3">
        <Card title="Total balance" value="$24,680.45" change="+8.4% this month" icon={CircleDollarSign}/>
        <Card title="Monthly deposits" value="$8,420.00" change="+12.5% this month" icon={ArrowDownLeft}/>
        <Card title="Monthly spending" value="$4,231.18" change="-3.2% this month" icon={ArrowUpRight}/>
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_.75fr]">
        <Panel title="Cash flow" subtitle="Income and spending overview">
          <div className="h-[230px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={activity} margin={{top:5,right:5,left:-25,bottom:0}}><defs><linearGradient id="customerCash" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#277d62" stopOpacity={0.25}/><stop offset="95%" stopColor="#277d62" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0ee"/><XAxis dataKey="name" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip/><Area type="monotone" dataKey="income" stroke="#277d62" strokeWidth={2} fill="url(#customerCash)"/></AreaChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="My accounts">        <div className="space-y-2">{accounts.map((account) => <button key={account.key} onClick={() => dispatch(selectAccount(account.key as "checking"|"savings"|"business"))} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${selected === account.key ? "border-[#bcdacf] bg-[#f2f8f5]" : "border-[#edf0ee]"}`}><div className="grid h-10 w-10 place-items-center rounded-lg bg-[#edf3f0] text-[#4e7565]"><CreditCard size={18}/></div><div className="flex-1"><p className="text-sm font-semibold">{account.label}</p><p className="text-xs text-[#929b96]">•••• {account.last}</p></div><p className="text-sm font-semibold">${account.balance.toLocaleString(undefined,{minimumFractionDigits:2})}</p></button>)}</div></Panel>
      </section>
      <TransactionsTable transactions={transactions}/>
      {transferOpen && <TransferModal onClose={() => setTransferOpen(false)} onSubmit={submitTransfer}/>}
    </div>
  );

  if (section === "accounts") return (
    <div>
      <div className="mb-5 flex gap-3"><input value={accountQuery} onChange={(event) => setAccountQuery(event.target.value)} placeholder="Search accounts" className="h-11 w-full max-w-sm rounded-lg border border-[#dde4df] bg-white px-3 text-sm outline-none"/><button onClick={() => setRequestOpen(true)} className="h-11 rounded-lg border border-[#dde4df] bg-white px-4 text-sm font-semibold">Request account</button></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{accounts.filter((account) => account.label.toLowerCase().includes(accountQuery.toLowerCase())).map((account) => <div key={account.key} className="rounded-2xl border border-[#edf0ee] bg-white p-5"><div className="flex items-center justify-between"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#edf5f1] text-[#277d62]"><CreditCard size={20}/></div><span className="rounded-full bg-[#edf7f3] px-2 py-1 text-xs text-[#277d62]">{account.status}</span></div><h3 className="mt-5 font-semibold">{account.label} Account</h3><p className="mt-1 text-xs text-[#929b96]">{account.type} •••• {account.last}</p><p className="mt-5 text-2xl font-semibold">${account.balance.toLocaleString(undefined,{minimumFractionDigits:2})}</p><div className="mt-4 flex justify-between border-t border-[#edf0ee] pt-4 text-xs text-[#7d8882]"><span>Available</span><span>{account.limit}</span></div></div>)}</div>
      {requestOpen && <SimpleModal title="Request new account" onClose={() => setRequestOpen(false)}><form onSubmit={submitRequest} className="mt-5 space-y-4"><select className="h-12 w-full rounded-lg border px-3"><option>Savings Account</option><option>Current Account</option><option>Business Account</option></select><textarea required placeholder="Purpose of the account" className="h-24 w-full rounded-lg border px-3 py-3"/><button className="h-12 w-full rounded-lg bg-[#176b50] text-sm font-semibold text-white">Submit request</button></form></SimpleModal>}
    </div>
  );

  if (section === "transactions") return <div><div className="mb-4 flex flex-wrap gap-3"><input placeholder="Search transaction ID" className="h-11 w-full max-w-sm rounded-lg border bg-white px-3 text-sm"/><select className="h-11 rounded-lg border bg-white px-3 text-sm"><option>All types</option><option>Deposit</option><option>Withdrawal</option><option>Fund Transfer</option></select><button className="h-11 rounded-lg border bg-white px-3 text-sm"><SlidersHorizontal className="inline mr-2" size={15}/>Filters</button></div><TransactionsTable transactions={transactions}/></div>;

  if (section === "transfers") return (
    <div className="grid gap-5 lg:grid-cols-[1fr_.65fr]"><Panel title="Send money" subtitle="Transfer within Trellis Bank"><form onSubmit={submitTransfer} className="space-y-4"><label className="block text-sm font-medium">Recipient account number<input name="recipient" required placeholder="TB-4821-1098" className="mt-2 h-12 w-full rounded-lg border px-3"/></label><label className="block text-sm font-medium">Amount<input name="amount" required type="number" min="0.01" step="0.01" placeholder="0.00" className="mt-2 h-12 w-full rounded-lg border px-3"/></label><label className="block text-sm font-medium">Description<input name="description" placeholder="What is this for?" className="mt-2 h-12 w-full rounded-lg border px-3"/></label><label className="block text-sm font-medium">Transaction PIN<input name="pin" required type="password" maxLength={4} placeholder="••••" className="mt-2 h-12 w-full rounded-lg border px-3"/></label><button className="h-12 w-full rounded-lg bg-[#176b50] text-sm font-semibold text-white">Review and send</button></form></Panel><Panel title="Transfer limits"><div className="space-y-5"><Limit label="Daily transfer limit" used="$1,250" total="$10,000" percent={13}/><Limit label="Single transaction" used="$2,500" total="$5,000" percent={50}/></div></Panel></div>
  );

  if (section === "loans") return (
    <div><div className="mb-5 flex justify-end"><button onClick={() => setLoanOpen(true)} className="h-11 rounded-lg bg-[#176b50] px-4 text-sm font-semibold text-white">Apply for loan</button></div><div className="grid gap-4 md:grid-cols-3"><Card title="Remaining balance" value="$18,450.00" change="Loan ending Jan 2028" icon={Landmark}/><Card title="Monthly payment" value="$742.80" change="Next due Dec 01" icon={Clock3}/><Card title="Application status" value={loanStatus} change="Personal loan • $24,000" icon={ReceiptText}/></div><Panel title="Repayment schedule" className="mt-5"><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-sm"><thead><tr className="text-left text-xs text-[#929b96]"><th className="pb-3">Due date</th><th className="pb-3">Payment</th><th className="pb-3">Principal</th><th className="pb-3">Status</th></tr></thead><tbody>{[["Dec 01, 2026","$742.80","$412.20","Upcoming"],["Nov 01, 2026","$742.80","$405.10","Paid"],["Oct 01, 2026","$742.80","$398.40","Paid"]].map((row)=><tr key={row[0]} className="border-t"><td className="py-3">{row[0]}</td><td className="py-3 font-semibold">{row[1]}</td><td className="py-3">{row[2]}</td><td className="py-3"><span className="rounded-full bg-[#edf7f3] px-2 py-1 text-xs text-[#277d62]">{row[3]}</span></td></tr>)}</tbody></table></div></Panel>{loanOpen && <SimpleModal title="Apply for a loan" onClose={() => setLoanOpen(false)}><form onSubmit={submitLoan} className="mt-5 space-y-4">    <select name="loanType" className="h-12 w-full rounded-lg border px-3"><option>Personal Loan</option><option>Home Loan</option><option>Auto Loan</option><option>Business Loan</option></select><div className="grid grid-cols-2 gap-3"><input name="amount" required type="number" placeholder="Requested amount" className="h-12 rounded-lg border px-3"/><input name="duration" required type="number" placeholder="Duration (months)" className="h-12 rounded-lg border px-3"/></div><input name="income" required type="number" placeholder="Monthly income" className="h-12 w-full rounded-lg border px-3"/><select name="employment" className="h-12 w-full rounded-lg border px-3"><option>Employed</option><option>Self-employed</option><option>Student</option></select><textarea name="description" required placeholder="Application description" className="h-24 w-full rounded-lg border px-3 py-3"/><button className="h-12 w-full rounded-lg bg-[#176b50] text-sm font-semibold text-white">Submit application</button></form></SimpleModal>}</div>
  );

  if (section === "statements") return (
    <div><Panel title="Download account statement" subtitle="Choose an account and statement period"><div className="grid gap-4 md:grid-cols-3"><select className="h-12 rounded-lg border px-3"><option>Checking •••• 4821</option><option>Savings •••• 1098</option></select><select className="h-12 rounded-lg border px-3"><option>November 2026</option><option>October 2026</option><option>September 2026</option></select><button onClick={downloadStatement} className="h-12 rounded-lg bg-[#176b50] px-4 text-sm font-semibold text-white"><Download className="mr-2 inline" size={16}/>Download CSV</button></div></Panel><TransactionsTable transactions={transactions} className="mt-5"/></div>
  );

  return <TransactionsTable transactions={transactions}/>;
}

function OperationsContent({ role, section, dispatch, setNotice }: { role: "admin"|"staff"; section: string; dispatch: any; setNotice: (value: string, type?: "success" | "error") => void }) {
  const transactions = useAppSelector((state) => state.transactions.items);
  const [customers, setCustomers] = useState(customersSeed);
  const [query, setQuery] = useState("");
  const [loanRows, setLoanRows] = useState<{id:string;customer:string;amount:string;type:string;status:string}[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [freeze, setFreeze] = useState<Record<string, boolean>>({});

  const filteredCustomers = customers.filter((customer) => `${customer.name} ${customer.email} ${customer.account}`.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (section !== "loan-review" && section !== "loan-management") return;
    fetch("/api/banking/loans")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load loan applications");
        return response.json();
      })
      .then(({ loans }) => setLoanRows(loans.map((loan: {id:string;customer?:{fullName:string};loanType:string;requestedAmount:string|number;status:string}) => ({
        id: loan.id,
        customer: loan.customer?.fullName || "Customer",
        amount: `$${Number(loan.requestedAmount).toLocaleString()}`,
        type: loan.loanType,
        status: loan.status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
      }))))
      .catch(() => setNotice("Unable to load loan applications.", "error"));
  }, [section, setNotice]);

  const updateLoan = async (id: string, status: "Approved"|"Rejected"|"Under Review") => {
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

  if (section === "overview") return (
    <div><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card title="Registered customers" value="2,842" change="+8.4% this month" icon={Users}/><Card title="Total bank accounts" value="4,617" change="+6.1% this month" icon={WalletCards}/><Card title="Total bank balance" value="$12.4M" change="+4.8% this month" icon={CircleDollarSign}/><Card title={role === "admin" ? "Pending loans" : "Pending requests"} value={role === "admin" ? "18" : "12"} change="Review required" icon={Landmark}/></section>{role === "admin" && <Panel title="Monthly banking activity" className="mt-5"><div className="h-[260px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={activity}><defs><linearGradient id="adminActivity" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#277d62" stopOpacity={0.22}/><stop offset="95%" stopColor="#277d62" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip/><Area type="monotone" dataKey="income" stroke="#277d62" strokeWidth={2} fill="url(#adminActivity)"/></AreaChart></ResponsiveContainer></div></Panel>}<Panel title={role === "staff" ? "Customer operations" : "Recent customers"} className="mt-5"><CustomerTable customers={customers} freeze={freeze} setFreeze={setFreeze} staff={role==="staff"}/></Panel></div>
  );

  if (section === "customers") return (
    <div><div className="mb-5 flex flex-wrap gap-3"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, or account" className="h-11 w-full max-w-sm rounded-lg border bg-white px-3 text-sm"/>{role === "staff" && <button onClick={() => setCreateOpen(true)} className="flex h-11 items-center gap-2 rounded-lg bg-[#176b50] px-4 text-sm font-semibold text-white"><UserRoundPlus size={16}/>Register customer</button>}{role === "admin" && <button onClick={() => setCreateOpen(true)} className="flex h-11 items-center gap-2 rounded-lg bg-[#176b50] px-4 text-sm font-semibold text-white"><UserRoundPlus size={16}/>Create account</button>}</div><Panel><CustomerTable customers={filteredCustomers} freeze={freeze} setFreeze={setFreeze} staff={role==="staff"}/></Panel>{createOpen && <SimpleModal title={role === "staff" ? "Register customer" : "Create bank account"} onClose={() => setCreateOpen(false)}><form onSubmit={(event) => { event.preventDefault(); setCreateOpen(false); setNotice(role === "staff" ? "Customer registered successfully." : "Bank account created successfully."); }} className="mt-5 space-y-4">{role==="staff" && <><input required placeholder="Full name" className="h-12 w-full rounded-lg border px-3"/><input required type="email" placeholder="Email address" className="h-12 w-full rounded-lg border px-3"/></>}<select className="h-12 w-full rounded-lg border px-3"><option>Savings Account</option><option>Current Account</option><option>Business Account</option></select><input required placeholder="Initial deposit" type="number" min="0" className="h-12 w-full rounded-lg border px-3"/><button className="h-12 w-full rounded-lg bg-[#176b50] text-sm font-semibold text-white">Confirm</button></form></SimpleModal>}</div>
  );

  if (section === "accounts") return (
    <div><div className="mb-5 flex flex-wrap gap-3"><input placeholder="Search account number" className="h-11 w-full max-w-sm rounded-lg border bg-white px-3 text-sm"/><button onClick={() => setCreateOpen(true)} className="h-11 rounded-lg bg-[#176b50] px-4 text-sm font-semibold text-white">Create account</button></div><Panel><div className="overflow-x-auto"><table className="w-full min-w-175 text-sm"><thead><tr className="text-left text-xs text-[#929b96]"><th className="pb-3">Account</th><th>Customer</th><th>Type</th><th>Balance</th><th>Status</th><th></th></tr></thead><tbody>{customers.map((customer)=><tr key={customer.id} className="border-t"><td className="py-3.5 font-semibold">•••• {customer.account}</td><td>{customer.name}</td><td>{customer.type}</td><td className="font-semibold">${customer.balance.toLocaleString(undefined,{minimumFractionDigits:2})}</td><td><span className="rounded-full bg-[#edf7f3] px-2 py-1 text-xs text-[#277d62]">{freeze[customer.id] ? "Frozen" : "Active"}</span></td><td><button onClick={() => setFreeze((value)=>({...value,[customer.id]:!value[customer.id]}))} className="text-xs font-semibold text-[#277d62]">{freeze[customer.id] ? "Unfreeze" : "Freeze"}</button></td></tr>)}</tbody></table></div></Panel>{createOpen && <SimpleModal title="Create bank account" onClose={()=>setCreateOpen(false)}><form onSubmit={(event)=>{event.preventDefault();setCreateOpen(false);setNotice("Bank account created successfully.");}} className="mt-5 space-y-4"><input required placeholder="Customer name" className="h-12 w-full rounded-lg border px-3"/><select className="h-12 w-full rounded-lg border px-3"><option>Savings Account</option><option>Current Account</option><option>Business Account</option></select><input required type="number" placeholder="Initial deposit" className="h-12 w-full rounded-lg border px-3"/><button className="h-12 w-full rounded-lg bg-[#176b50] text-sm font-semibold text-white">Create account</button></form></SimpleModal>}</div>
  );

  if (section === "transactions" || section === "pending-requests") {
    return <div><div className="mb-4 flex gap-3"><input placeholder="Search transaction ID" className="h-11 w-full max-w-sm rounded-lg border bg-white px-3 text-sm"/><select className="h-11 rounded-lg border bg-white px-3 text-sm"><option>All types</option><option>Deposit</option><option>Withdrawal</option></select></div><Panel><div className="overflow-x-auto"><table className="w-full min-w-175 text-sm"><thead><tr className="text-left text-xs text-[#929b96]"><th className="pb-3">Transaction</th><th>Description</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>{transactions.map((row)=><tr key={row.id} className="border-t"><td className="py-3.5 font-semibold">{row.id}</td><td>{row.name}</td><td className="font-semibold">${Math.abs(row.amount).toLocaleString()}</td><td><span className="rounded-full bg-[#edf7f3] px-2 py-1 text-xs text-[#277d62]">{row.status}</span></td><td>{row.date}</td><td>{role==="staff" && <button onClick={()=>setNotice("Transaction flagged for admin review.")} className="text-xs font-semibold text-[#b06e30]">Flag</button>}</td></tr>)}</tbody></table></div></Panel></div>;
  }

  if (section === "loan-review" || section === "loan-management") return (
    <div><Panel title="Loan applications"><div className="overflow-x-auto"><table className="w-full min-w-190 text-sm"><thead><tr className="text-left text-xs text-[#929b96]"><th className="pb-3">Application</th><th>Customer</th><th>Type</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{loanRows.map((row)=><tr key={row.id} className="border-t"><td className="py-3.5 font-semibold">{row.id}</td><td>{row.customer}</td><td>{row.type}</td><td className="font-semibold">{row.amount}</td><td><span className="rounded-full bg-[#fff4df] px-2 py-1 text-xs text-[#a77728]">{row.status}</span></td><td>{role==="admin" ? <div className="flex gap-2"><button onClick={()=>updateLoan(row.id,"Approved")} className="rounded-lg bg-[#176b50] px-3 py-1.5 text-xs text-white">Approve</button><button onClick={()=>updateLoan(row.id,"Rejected")} className="rounded-lg border px-3 py-1.5 text-xs">Reject</button></div> : <button onClick={()=>updateLoan(row.id,"Under Review")} className="rounded-lg border px-3 py-1.5 text-xs font-semibold">Add note / Forward</button>}</td></tr>)}</tbody></table></div></Panel></div>
  );

  if (section === "settings") return (
    <div className="grid gap-5 lg:grid-cols-2"><Panel title="Transaction limits"><form onSubmit={(event)=>{event.preventDefault();setNotice("Bank transaction settings updated.");}} className="space-y-4"><label className="block text-sm">Daily transfer limit<input defaultValue="10000" type="number" className="mt-2 h-12 w-full rounded-lg border px-3"/></label><label className="block text-sm">Maximum single transaction<input defaultValue="5000" type="number" className="mt-2 h-12 w-full rounded-lg border px-3"/></label><label className="block text-sm">Minimum account balance<input defaultValue="25" type="number" className="mt-2 h-12 w-full rounded-lg border px-3"/></label><button className="h-12 w-full rounded-lg bg-[#176b50] text-sm font-semibold text-white">Save settings</button></form></Panel><Panel title="Suspicious transaction rules"><div className="space-y-3">{["Transfers above $5,000","5 or more transfers per hour","Login from a new device"].map((rule)=><label key={rule} className="flex items-center justify-between rounded-lg border p-3 text-sm"><span>{rule}</span><input type="checkbox" defaultChecked className="h-4 w-4 accent-[#176b50]"/></label>)}</div></Panel></div>
  );

  return <Panel title="Customer workspace"><CustomerTable customers={customers} freeze={freeze} setFreeze={setFreeze} staff={role==="staff"}/></Panel>;
}

function Panel({ title, subtitle, className = "", children }: { title?: string; subtitle?: string; className?: string; children: React.ReactNode }) {
  return <section className={`rounded-2xl border border-[#edf0ee] bg-white p-5 ${className}`}>{title && <div className="mb-4"><h2 className="font-semibold">{title}</h2>{subtitle && <p className="mt-1 text-xs text-[#929b96]">{subtitle}</p>}</div>}{children}</section>;
}

function TransactionsTable({ transactions, className = "" }: { transactions: any[]; className?: string }) {
  return <section className={`rounded-2xl border border-[#edf0ee] bg-white ${className}`}><div className="border-b border-[#edf0ee] px-5 py-4"><h2 className="font-semibold">Recent transactions</h2><p className="mt-1 text-xs text-[#929b96]">Latest account activity</p></div><div className="divide-y divide-[#f0f2f1]">{transactions.slice(0,8).map((tx)=>{const credit=tx.amount>0;return <div key={tx.id} className="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-3.5 md:grid-cols-[1.4fr_1fr_1fr_auto]"><div className="flex items-center gap-3"><div className={`grid h-9 w-9 place-items-center rounded-full ${credit?"bg-[#eaf5ef] text-[#277d62]":"bg-[#f2f3f2] text-[#69746f]"}`}>{credit?<ArrowDownLeft size={17}/>:<ArrowUpRight size={17}/>}</div><div><p className="text-sm font-semibold">{tx.name}</p><p className="text-xs text-[#9aa39e]">{tx.detail}</p></div></div><p className="hidden text-xs text-[#7d8882] md:block">{tx.date}</p><p className="hidden text-xs text-[#7d8882] md:block">{tx.id}</p><div className="text-right"><p className={`text-sm font-semibold ${credit?"text-[#277d62]":"text-[#26312c]"}`}>{credit?"+" : "-"}${Math.abs(tx.amount).toLocaleString(undefined,{minimumFractionDigits:2})}</p><p className="mt-1 text-[10px] text-[#277d62]">{tx.status}</p></div></div>})}</div></section>;
}

function CustomerTable({ customers, freeze, setFreeze, staff }: { customers: typeof customersSeed; freeze: Record<string,boolean>; setFreeze: any; staff: boolean }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-180 text-left text-sm"><thead><tr className="text-xs text-[#929b96]"><th className="pb-3 font-medium">Customer</th><th className="pb-3 font-medium">Account</th><th className="pb-3 font-medium">Type</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Balance</th><th></th></tr></thead><tbody>{customers.map((customer)=><tr key={customer.id} className="border-t border-[#f0f2f1]"><td className="py-3.5"><p className="font-semibold">{customer.name}</p><p className="text-xs text-[#929b96]">{customer.email}</p></td><td>•••• {customer.account}</td><td>{customer.type}</td><td><span className={`rounded-full px-2 py-1 text-xs ${customer.status==="Active"?"bg-[#edf7f3] text-[#277d62]":"bg-[#fff4df] text-[#a77728]"}`}>{freeze[customer.id]?"Frozen":customer.status}</span></td><td className="font-semibold">${customer.balance.toLocaleString(undefined,{minimumFractionDigits:2})}</td><td><button onClick={()=>setFreeze((value:Record<string,boolean>)=>({...value,[customer.id]:!value[customer.id]}))} className="rounded-lg border px-3 py-1.5 text-xs font-semibold">{freeze[customer.id]?"Unfreeze":staff?"Review":"Manage"}</button></td></tr>)}</tbody></table></div>;
}

function Limit({ label, used, total, percent }: { label:string; used:string; total:string; percent:number }) {
  return <div><div className="flex justify-between text-sm"><span className="font-medium">{label}</span><span className="text-[#929b96]">{used} / {total}</span></div><div className="mt-3 h-2 rounded-full bg-[#edf0ee]"><div className="h-2 rounded-full bg-[#277d62]" style={{width:`${percent}%`}}/></div></div>;
}

function TransferModal({ onClose, onSubmit }: { onClose:()=>void; onSubmit:(event:React.FormEvent<HTMLFormElement>)=>void }) {
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-[#102019]/35 p-4 backdrop-blur-sm"><form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8a958f]">New payment</p><h2 className="mt-1 text-xl font-semibold">Transfer money</h2></div><button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#f2f4f3]"><X size={18}/></button></div><div className="mt-6 space-y-4"><label className="block text-sm font-medium">Recipient account number<input name="recipient" placeholder="1098" className="mt-2 h-12 w-full rounded-lg border px-3"/></label><label className="block text-sm font-medium">Amount<input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" className="mt-2 h-12 w-full rounded-lg border px-3"/></label><label className="block text-sm font-medium">Transaction PIN<input name="pin" type="password" maxLength={4} placeholder="••••" className="mt-2 h-12 w-full rounded-lg border px-3"/></label></div><button className="mt-6 h-12 w-full rounded-lg bg-[#176b50] text-sm font-semibold text-white">Confirm transfer</button></form></div>;
}

function SimpleModal({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) {
  return <div className="fixed inset-0 z-70 grid place-items-center bg-[#102019]/35 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">{title}</h2><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#f2f4f3]"><X size={18}/></button></div>{children}</div></div>;
}
