"use client";

import type { FormEvent } from "react";
import { Clock3, Landmark, ReceiptText } from "lucide-react";
import Card from "@/components/shared/Card";
import Panel from "@/components/shared/Panel";
import SimpleModal from "@/components/shared/SimpleModal";

type LoansPageProps = {
  loanStatus: string;
  loanOpen: boolean;
  onOpenLoan: () => void;
  onCloseLoan: () => void;
  onSubmitLoan: (event: FormEvent<HTMLFormElement>) => void;
};

export default function LoansPage({
  loanStatus,
  loanOpen,
  onOpenLoan,
  onCloseLoan,
  onSubmitLoan,
}: LoansPageProps) {
  return (
    <div>
      <div className="mb-5 flex justify-end"><button onClick={onOpenLoan} className="h-11 rounded-lg bg-[#176b50] px-4 text-sm font-semibold text-white">Apply for loan</button></div>
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
            <button className="h-12 w-full rounded-lg bg-[#176b50] text-sm font-semibold text-white">Submit application</button>
          </form>
        </SimpleModal>
      )}
    </div>
  );
}
