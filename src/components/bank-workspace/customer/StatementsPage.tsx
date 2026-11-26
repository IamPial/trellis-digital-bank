"use client";

import { Download } from "lucide-react";
import Panel from "@/components/shared/Panel";
import TransactionsTable from "@/components/shared/TransactionsTable";
import type { Transaction } from "@/store/store";

type StatementsPageProps = {
  transactions: Transaction[];
  onDownloadStatement: () => void;
};

export default function StatementsPage({
  transactions,
  onDownloadStatement,
}: StatementsPageProps) {
  return (
    <div>
      <Panel title="Download account statement" subtitle="Choose an account and statement period">
        <div className="grid gap-4 md:grid-cols-3">
          <select className="h-12 rounded-lg border px-3"><option>Checking •••• 4821</option><option>Savings •••• 1098</option></select>
          <select className="h-12 rounded-lg border px-3"><option>November 2026</option><option>October 2026</option><option>September 2026</option></select>
          <button onClick={onDownloadStatement} className="h-12 rounded-lg bg-[#176b50] px-4 text-sm font-semibold text-white"><Download className="mr-2 inline" size={16} />Download CSV</button>
        </div>
      </Panel>
      <TransactionsTable transactions={transactions} className="mt-5" />
    </div>
  );
}
