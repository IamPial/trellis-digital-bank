"use client";

import Panel from "@/components/shared/Panel";
import type { LoanRow } from "@/components/shared/types";

type AdminLoanManagementPageProps = {
  loanRows: LoanRow[];
  onUpdateLoan: (id: string, status: "Approved" | "Rejected") => void;
};

export default function AdminLoanManagementPage({ loanRows, onUpdateLoan }: AdminLoanManagementPageProps) {
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
                  <div className="flex gap-2">
                    <button onClick={() => onUpdateLoan(row.id, "Approved")} className="rounded-lg bg-[#176b50] px-3 py-1.5 text-xs text-white">Approve</button>
                    <button onClick={() => onUpdateLoan(row.id, "Rejected")} className="rounded-lg border px-3 py-1.5 text-xs">Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
