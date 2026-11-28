"use client";

import type { FormEvent } from "react";
import { Clock3, Landmark, ReceiptText } from "lucide-react";
import Card from "@/components/shared/Card";
import Panel from "@/components/shared/Panel";
import SimpleModal from "@/components/shared/SimpleModal";
import type { CustomerLoan } from "./types";

type LoansPageProps = {
  loans: CustomerLoan[];
  loansLoading: boolean;
  loanOpen: boolean;
  loanSubmitting: boolean;
  onOpenLoan: () => void;
  onCloseLoan: () => void;
  onSubmitLoan: (event: FormEvent<HTMLFormElement>) => void;
};

const formatCurrency = (value: number | string | null) =>
  value == null ? "—" : `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatStatus = (status: string) =>
  status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function LoansPage({
  loans,
  loansLoading,
  loanOpen,
  loanSubmitting,
  onOpenLoan,
  onCloseLoan,
  onSubmitLoan,
}: LoansPageProps) {
  const activeLoans = loans.filter((loan) => loan.status === "active" || loan.status === "approved");
  const outstandingBalance = activeLoans.reduce(
    (total, loan) => total + Number(loan.remainingBalance ?? loan.approvedAmount ?? loan.requestedAmount),
    0,
  );
  const latestLoan = loans[0];

  return (
    <div>
      <div className="mb-5 flex justify-end"><button onClick={onOpenLoan} className="h-11 rounded-lg bg-[#176b50] px-4 text-sm font-semibold text-white">Apply for loan</button></div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Outstanding balance" value={formatCurrency(outstandingBalance)} change={`${activeLoans.length} active loan${activeLoans.length === 1 ? "" : "s"}`} icon={Landmark} />
        <Card title="Active loans" value={String(activeLoans.length)} change="Approved and disbursed" icon={Clock3} />
        <Card title="Latest application" value={latestLoan ? formatStatus(latestLoan.status) : "None"} change={latestLoan ? `${latestLoan.loanType} • ${formatCurrency(latestLoan.requestedAmount)}` : "No applications yet"} icon={ReceiptText} />
      </div>
      <Panel title="Loan applications" className="mt-5">
        <div className="overflow-x-auto">
          {loansLoading ? (
            <p className="py-6 text-sm text-[#929b96]">Loading loan applications...</p>
          ) : loans.length === 0 ? (
            <p className="py-6 text-sm text-[#929b96]">You have no loan applications yet.</p>
          ) : (
            <table className="w-full min-w-[760px] text-sm">
              <thead><tr className="text-left text-xs text-[#929b96]"><th className="pb-3">Loan</th><th className="pb-3">Requested</th><th className="pb-3">Term</th><th className="pb-3">Status</th><th className="pb-3">Approved</th><th className="pb-3">Remaining</th><th className="pb-3">Submitted</th></tr></thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} className="border-t">
                    <td className="py-3 font-medium">{loan.loanType}</td>
                    <td>{formatCurrency(loan.requestedAmount)}</td>
                    <td>{loan.loanDurationMonths} months</td>
                    <td><span className={`rounded-full px-2 py-1 text-xs ${loan.status === "active" || loan.status === "approved" ? "bg-[#edf7f3] text-[#277d62]" : loan.status === "rejected" ? "bg-[#fff0ed] text-[#bd5842]" : "bg-[#fff4df] text-[#a77728]"}`}>{formatStatus(loan.status)}</span></td>
                    <td>{formatCurrency(loan.approvedAmount)}</td>
                    <td>{formatCurrency(loan.remainingBalance)}</td>
                    <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Panel>
      {loanOpen && (
        <SimpleModal title="Apply for a loan" onClose={onCloseLoan}>
          <form onSubmit={onSubmitLoan} className="mt-5 space-y-4">
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
            <button disabled={loanSubmitting} className="h-12 w-full rounded-lg bg-[#176b50] text-sm font-semibold text-white disabled:opacity-70">{loanSubmitting ? "Submitting..." : "Submit application"}</button>
          </form>
        </SimpleModal>
      )}
    </div>
  );
}
