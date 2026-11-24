"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft, ArrowUpRight, Bell, Building2, CheckCircle2, ChevronDown,
  CircleDollarSign, CreditCard, Download, Landmark, LayoutDashboard,
  LifeBuoy, Menu, MoreHorizontal, ReceiptText, Search, Send, Settings,
  SlidersHorizontal, UserRoundPlus, Users, WalletCards, X, Clock3
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addTransaction, clearAuth, selectAccount, setAuth } from "@/store/store";

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
  const [notice, setNotice] = useState("");
  const [roleReady, setRoleReady] = useState(false);

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
    dispatch(clearAuth());
    router.replace("/login");
  };

  if (!roleReady) return null;

  return (
    <div className="min-h-screen bg-[#f6f8f7] text-[#1b2520]">
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
            <button className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-[#f3f5f4]"><Bell size={19}/><span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#df7258]"/></button>
            <div className="flex items-center gap-2 rounded-lg p-1.5"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#dcebe5] text-sm font-bold text-[#176b50]">{name.split(" ").map((n) => n[0]).join("")}</div><div className="hidden text-left sm:block"><p className="text-xs font-semibold">{name}</p><p className="text-[10px] capitalize text-[#8a958f]">{role}</p></div><ChevronDown size={15}/></div>
          </div>
        </header>

        <div className="mx-auto max-w-[1280px] px-5 py-7 md:px-8">
          {notice && <div className="mb-5 flex items-center justify-between rounded-xl border border-[#bfe1d3] bg-[#edf8f3] px-4 py-3 text-sm text-[#176b50]"><span className="flex items-center gap-2"><CheckCircle2 size={17}/>{notice}</span><button onClick={() => setNotice("")}><X size={16}/></button></div>}
          <div className="mb-7"><p className="text-sm text-[#8b9690]">Monday, November 24</p><h1 className="mt-1 text-2xl font-semibold capitalize tracking-tight md:text-[28px]">{nav.find((item) => item[1] === section)?.[0] || normalized}</h1></div>
          {role === "customer" ? <CustomerContent section={section} dispatch={dispatch} setNotice={setNotice}/> : <OperationsContent role={role} section={section} dispatch={dispatch} setNotice={setNotice}/>}
        </div>
      </main>
    </div>
  );
}
