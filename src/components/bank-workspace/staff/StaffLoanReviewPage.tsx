"use client";

import Panel from "@/components/shared/Panel";
import type { StaffLoanRow } from "./types";

type StaffLoanReviewPageProps = {
  loanRows: StaffLoanRow[];
  onForward: (id: string) => void;
};

export default function StaffLoanReviewPage({ loanRows, onForward }: StaffLoanReviewPageProps) {
  return (
    <Panel title="Loan applications">
      <div className="overflow-x-auto">
        <table className="w-full min-w-190 text-sm">
          <thead>
            <tr className="text-left text-xs text-[#929b96]">
              <th className="pb-3">Application</th><th>Customer</th><th>Type</th><th>Amount</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loanRows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="py-3.5 font-semibold">{row.id}</td>
                <td>{row.customer}</td>
                <td>{row.type}</td>
                <td className="font-semibold">{row.amount}</td>
                <td><span className="rounded-full bg-[#fff4df] px-2 py-1 text-xs text-[#a77728]">{row.status}</span></td>
                <td>
                  <button
                    onClick={() => onForward(row.id)}
                    className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                  >
                    Add note / Forward
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
