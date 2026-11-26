"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Bell,
  ChevronDown,
  Clock3,
  Download,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  ReceiptText,
  Search,
  Send,
  Settings,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuth, setAuth, type Role } from "@/store/store";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";
import TrellisLogo from "@/components/TrellisLogo";
import CustomerContent from "@/components/bank-workspace/CustomerContent";
import OperationsContent from "@/components/bank-workspace/OperationsContent";

type Props = { section?: string };
type NavItem = [label: string, key: string, icon: LucideIcon];

const subscribeToSession = (callback: () => void) => {
  window.addEventListener("trellis-session-change", callback);
  return () => window.removeEventListener("trellis-session-change", callback);
};

const getCookieRole = (): Role | null => {
  const cookieRole = document.cookie
    .split("; ")
    .find((row) => row.startsWith("trellis_role="))
    ?.split("=")[1];
  return cookieRole === "admin" || cookieRole === "staff" || cookieRole === "customer"
    ? cookieRole
    : null;
};

const navigation: Record<Role, NavItem[]> = {
  customer: [
    ["Overview", "overview", LayoutDashboard],
    ["Accounts", "accounts", WalletCards],
    ["Transactions", "transactions", ReceiptText],
    ["Transfers", "transfers", Send],
    ["Loans", "loans", Landmark],
    ["Statements", "statements", Download],
  ],
  staff: [
    ["Overview", "overview", LayoutDashboard],
    ["Customers", "customers", Users],
    ["Transactions", "transactions", ReceiptText],
    ["Loan Review", "loan-review", Landmark],
    ["Pending Requests", "pending-requests", Clock3],
  ],
  admin: [
    ["Overview", "overview", LayoutDashboard],
    ["Customers", "customers", Users],
    ["Accounts", "accounts", WalletCards],
    ["Transactions", "transactions", ReceiptText],
    ["Loan Management", "loan-management", Landmark],
    ["Settings", "settings", Settings],
  ],
};

const roleNames: Record<Role, string> = {
  admin: "Alex Morgan",
  staff: "Jordan Lee",
  customer: "Jamie Parker",
};

export default function BankWorkspace({ section = "overview" }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const [mobileNav, setMobileNav] = useState(false);
  const cookieRole = useSyncExternalStore(subscribeToSession, getCookieRole, () => null);
  const setNotice = useCallback((message: string, type: "success" | "error" = "success") => {
    toast[type](message);
  }, []);

  useEffect(() => {
    if (!auth.role && cookieRole) {
      dispatch(setAuth({ role: cookieRole, name: roleNames[cookieRole] }));
    }
  }, [auth.role, cookieRole, dispatch]);

  const role = auth.role || cookieRole;
  if (!role) return null;
  const name = auth.name || roleNames[role];
  const nav = navigation[role];
  const normalizedSection = section.toLowerCase().replaceAll("-", " ");
  const pageTitle = role === "customer" && section === "overview"
    ? `Welcome back, ${name.split(" ")[0]} !`
    : nav.find(([, key]) => key === section)?.[0] || normalizedSection;
  const today = format(new Date(), "EEEE, MMMM d");

  const logout = () => {
    document.cookie = "trellis_role=; path=/; max-age=0";
    document.cookie = "trellis_session=; path=/; max-age=0";
    dispatch(clearAuth());
    router.replace("/login");
  };

  return (
    <div data-bank-app className="min-h-screen bg-[#f6f8f7] text-[#1b2520]">
      {mobileNav && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}
      <aside className={`fixed left-0 top-0 z-50 h-screen w-59 border-r border-[#e7ebe8] bg-white px-4 py-5 transition-transform lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={() => router.push("/dashboard")} className="flex h-10 items-center gap-3 px-2">
          <TrellisLogo priority className="h-auto w-45" />
        </button>
        <nav className="mt-8 space-y-1">
          {nav.map(([label, key, Icon]) => (
            <button
              key={key}
              onClick={() => {
                router.push(key === "overview" ? "/dashboard" : `/dashboard/${key}`);
                setMobileNav(false);
              }}
              className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm ${section === key ? "bg-[#edf5f1] font-semibold text-[#176b50]" : "text-[#738078] hover:bg-[#f5f7f6]"}`}
            >
              <Icon size={18} strokeWidth={1.8} />{label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-5 left-4 right-4">
          <button className="mb-1 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-[#738078]">
            <LifeBuoy size={18} />Help center
          </button>
          <button onClick={logout} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-[#738078]">
            <Settings size={18} />Sign out
          </button>
        </div>
      </aside>

      <main className="lg:ml-59">
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-[#edf0ee] bg-white/95 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNav(true)} className="grid h-10 w-10 place-items-center rounded-lg border lg:hidden">
              <Menu size={20} />
            </button>
            <div className="hidden h-10 w-65 items-center gap-2 rounded-lg bg-[#f4f6f5] px-3 text-[#96a099] md:flex">
              <Search size={17} />
              <input aria-label="Search" placeholder="Search customers or transactions" className="w-full bg-transparent text-sm outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-[#f3f5f4]">
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#df7258]" />
            </button>
            <div className="flex items-center gap-2 rounded-lg p-1.5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#dcebe5] text-sm font-bold text-[#176b50]">
                {name.split(" ").map((part) => part[0]).join("")}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold">{name}</p>
                <p className="text-[10px] capitalize text-[#8a958f]">{role}</p>
              </div>
              <ChevronDown size={15} />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-7 md:px-8">
          <div className="mb-7">
            <p className="text-sm text-[#8b9690]">{today}</p>
            <h1 className="mt-1 text-2xl font-semibold capitalize tracking-tight md:text-[28px]">
              {pageTitle}
            </h1>
          </div>
          {role === "customer" ? (
            <CustomerContent section={section} setNotice={setNotice} />
          ) : (
            <OperationsContent role={role} section={section} setNotice={setNotice} />
          )}
        </div>
      </main>
    </div>
  );
}
