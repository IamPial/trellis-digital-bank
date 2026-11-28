"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";
import TrellisLogo from "@/components/TrellisLogo";
import desktopLogo from "@/assets/trellis-dark.png";
import type { Role } from "@/store/store";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Exclude<Role, "admin">>("customer");
  const router = useRouter();

  const register = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          password,
          transactionPin: formData.get("transactionPin"),
          accountType: formData.get("accountType"),
          role,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Account registration failed");
        return;
      }

      toast.success("Registration successful. Please sign in.");
      router.push("/login");
    } catch {
      toast.error("Unable to create your account. Check your connection and try again.");
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
          <Image src={desktopLogo} alt="Trellis Bank Digital Banking" priority className="h-auto w-65 max-w-[70%]" />
        </div>
        <div className="relative z-10 max-w-xl pb-12">
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.04em]">Build a brighter financial future</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-blue-100/75">Open a Trellis account and manage payments, transfers, and savings in one secure place.</p>
        </div>
        <p className="relative z-10 text-xs text-blue-100/60">© 2026 Trellis Digital Bank</p>
      </section>

      <section className="flex-1 flex items-start justify-center px-6 pt-24 pb-10 lg:items-center lg:py-10">
        <div data-login-panel className="w-full max-w-105 rounded-2xl border border-[#e1e7f0] bg-white p-7 shadow-[0_20px_60px_rgba(27,39,58,.08)] md:p-9">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <TrellisLogo priority className="h-auto w-55" />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#17211d]">Create your account</h2>
          <p className="mt-2 text-sm text-[#778078]">Start banking securely with Trellis.</p>

          <form onSubmit={register} className="mt-7 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-[#33413b]">Full name</span>
              <div className="relative mt-2">
                <UserRound className="absolute left-4 top-3.5 text-[#96a09a]" size={18} />
                <input name="fullName" required autoComplete="name" placeholder="Jamie Parker" className="h-12 w-full rounded-xl border border-[#dde4df] bg-white pl-11 pr-4 outline-none transition focus:border-[#278367] focus:ring-4 focus:ring-[#278367]/10" />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#33413b]">Email address</span>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-3.5 text-[#96a09a]" size={18} />
                <input name="email" required type="email" autoComplete="email" placeholder="jamie@example.com" className="h-12 w-full rounded-xl border border-[#dde4df] bg-white pl-11 pr-4 outline-none transition focus:border-[#278367] focus:ring-4 focus:ring-[#278367]/10" />
              </div>
            </label>
            <div>
              <span className="text-sm font-medium text-[#33413b]">Join as</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["customer", "staff"] as const).map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setRole(item)}
                    className={`h-10 rounded-lg border text-sm capitalize transition ${role === item ? "border-[#277d62] bg-[#edf7f3] text-[#1d6751]" : "border-[#e0e5e2] bg-white text-[#737c77]"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-[#33413b]">Password</span>
                <div className="relative mt-2">
                  <LockKeyhole className="absolute left-4 top-3.5 text-[#96a09a]" size={18} />
                  <input name="password" required minLength={8} type="password" autoComplete="new-password" className="h-12 w-full rounded-xl border border-[#dde4df] bg-white pl-11 pr-4 outline-none transition focus:border-[#278367] focus:ring-4 focus:ring-[#278367]/10" />
                </div>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#33413b]">Confirm password</span>
                <div className="relative mt-2">
                  <LockKeyhole className="absolute left-4 top-3.5 text-[#96a09a]" size={18} />
                  <input name="confirmPassword" required minLength={8} type="password" autoComplete="new-password" className="h-12 w-full rounded-xl border border-[#dde4df] bg-white pl-11 pr-4 outline-none transition focus:border-[#278367] focus:ring-4 focus:ring-[#278367]/10" />
                </div>
              </label>
            </div>
            {role === "customer" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-[#33413b]">Account type</span>
                  <select name="accountType" defaultValue="savings" className="mt-2 h-12 w-full rounded-xl border border-[#dde4df] bg-white px-4 outline-none transition focus:border-[#278367] focus:ring-4 focus:ring-[#278367]/10">
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                    <option value="business">Business</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#33413b]">Transaction PIN</span>
                  <input name="transactionPin" required pattern="[0-9]{4}" inputMode="numeric" maxLength={4} placeholder="4 digits" className="mt-2 h-12 w-full rounded-xl border border-[#dde4df] bg-white px-4 outline-none transition focus:border-[#278367] focus:ring-4 focus:ring-[#278367]/10" />
                </label>
              </div>
            ) : (
              <p className="text-sm text-[#778078]">This role does not require a bank account or transaction PIN.</p>
            )}
            <button disabled={loading} className="h-12 w-full rounded-xl bg-[#176b50] text-white font-semibold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(23,107,80,.18)] hover:bg-[#125940] transition disabled:opacity-70">
              {loading ? "Creating account..." : "Create account"} <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#778078]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#2864ea] hover:underline">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
