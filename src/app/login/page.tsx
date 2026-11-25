"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { setAuth, Role } from "@/store/store";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";
import Image from "next/image";
import TrellisLogo from "@/components/TrellisLogo";
import desktopLogo from "@/assets/trellis-dark.png";

export default function LoginPage() {
  const [role, setRole] = useState<Role>("customer");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(event.currentTarget as HTMLFormElement);
      const email = role === "admin" ? "admin@trellis.bank" : role === "staff" ? "staff@trellis.bank" : "jamie@trellis.bank";
      const password = String(form.get("password") || "trellisdemo");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Sign-in failed");
        return;
      }
      dispatch(setAuth({ role: result.role, name: result.name }));
      toast.success("Signed in successfully");
      router.push("/dashboard");
    } catch {
      toast.error("Unable to sign in. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main data-bank-app data-login-page className="relative min-h-screen bg-[#f4f7fb] flex">
      <div className="absolute right-5 top-5 z-20"><ThemeToggle /></div>
      <section className="hidden lg:flex w-[58%] bg-[#102d25] relative overflow-hidden flex-col justify-between p-14 text-white">
        <div className="login-art absolute inset-0 opacity-25" />
        <div className="relative z-10 flex items-center gap-3">
          <Image
            src={desktopLogo}
            alt="Trellis Bank Digital Banking"
            priority
            className="h-auto w-65 max-w-[70%]"
          />
        </div>
        <div className="relative z-10 max-w-xl pb-12">
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.04em]">Trust with Trellis Platform</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-blue-100/75">Move money and build your future with one secure financial account.</p>
        </div>
        <p className="relative z-10 text-xs text-blue-100/60">© 2026 Trellis Digital Bank</p>
      </section>

      <section className="flex-1 flex items-center justify-center px-6 py-10">
        <div data-login-panel className="w-full max-w-105 rounded-2xl border border-[#e1e7f0] bg-white p-7 shadow-[0_20px_60px_rgba(27,39,58,.08)] md:p-9">
          <div className="lg:hidden mb-10 flex items-center gap-3">
            <TrellisLogo
              priority
              className="h-auto w-55"
            />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#17211d]">Welcome back</h2>
          <p className="mt-2 text-sm text-[#778078]">Sign in to your trellis account.</p>

          <form onSubmit={login} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-[#33413b]">Email address</span>
              <input name="email" defaultValue="jamie@trellis.bank" className="mt-2 h-12 w-full rounded-xl border border-[#dde4df] bg-white px-4 outline-none transition focus:border-[#278367] focus:ring-4 focus:ring-[#278367]/10" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#33413b]">Password</span>
              <div className="relative mt-2">
                <LockKeyhole className="absolute left-4 top-3.5 text-[#96a09a]" size={18} />
                <input name="password" type="password" defaultValue="trellisdemo" className="h-12 w-full rounded-xl border border-[#dde4df] bg-white pl-11 pr-4 outline-none transition focus:border-[#278367] focus:ring-4 focus:ring-[#278367]/10" />
              </div>
            </label>
            <div>
              <span className="text-sm font-medium text-[#33413b]">Join as</span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["customer","staff","admin"] as Role[]).map((item) => (
                  <button type="button" key={item} onClick={() => setRole(item)} className={`h-10 rounded-lg border text-sm capitalize transition ${role === item ? "border-[#277d62] bg-[#edf7f3] text-[#1d6751]" : "border-[#e0e5e2] bg-white text-[#737c77]"}`}>{item}</button>
                ))}
              </div>
            </div>
            <button disabled={loading} className="h-12 w-full rounded-xl bg-[#176b50] text-white font-semibold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(23,107,80,.18)] hover:bg-[#125940] transition disabled:opacity-70">
              {loading ? "Signing in..." : "Sign in"} <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
