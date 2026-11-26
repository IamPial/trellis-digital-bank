"use client";

import type { FormEvent } from "react";
import Limit from "@/components/shared/Limit";
import Panel from "@/components/shared/Panel";

type TransfersPageProps = {
  onSubmitTransfer: (event: FormEvent<HTMLFormElement>) => void;
};

export default function TransfersPage({ onSubmitTransfer }: TransfersPageProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_.65fr]">
      <Panel title="Send money" subtitle="Transfer within Trellis Bank">
        <form onSubmit={onSubmitTransfer} className="space-y-4">
          <label className="block text-sm font-medium">Recipient account number<input name="recipient" required placeholder="TB-4821-1098" className="mt-2 h-12 w-full rounded-lg border px-3" /></label>
          <label className="block text-sm font-medium">Amount<input name="amount" required type="number" min="0.01" step="0.01" placeholder="0.00" className="mt-2 h-12 w-full rounded-lg border px-3" /></label>
          <label className="block text-sm font-medium">Description<input name="description" placeholder="What is this for?" className="mt-2 h-12 w-full rounded-lg border px-3" /></label>
          <label className="block text-sm font-medium">Transaction PIN<input name="pin" required type="password" maxLength={4} placeholder="••••" className="mt-2 h-12 w-full rounded-lg border px-3" /></label>
          <button className="h-12 w-full rounded-lg bg-[#176b50] text-sm font-semibold text-white">Review and send</button>
        </form>
      </Panel>
      <Panel title="Transfer limits">
        <div className="space-y-5">
          <Limit label="Daily transfer limit" used="$1,250" total="$10,000" percent={13} />
          <Limit label="Single transaction" used="$2,500" total="$5,000" percent={50} />
        </div>
      </Panel>
    </div>
  );
}
