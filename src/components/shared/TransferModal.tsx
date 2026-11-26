"use client";

import type { FormEvent } from "react";
import { X } from "lucide-react";

type TransferModalProps = {
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function TransferModal({ onClose, onSubmit }: TransferModalProps) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#102019]/35 p-4 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8a958f]">New payment</p>
            <h2 className="mt-1 text-xl font-semibold">Transfer money</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#f2f4f3]">
            <X size={18} />
          </button>
        </div>
        <div className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Recipient account number
            <input name="recipient" placeholder="1098" className="mt-2 h-12 w-full rounded-lg border px-3" />
          </label>
          <label className="block text-sm font-medium">
            Amount
            <input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" className="mt-2 h-12 w-full rounded-lg border px-3" />
          </label>
          <label className="block text-sm font-medium">
            Transaction PIN
            <input name="pin" type="password" maxLength={4} placeholder="••••" className="mt-2 h-12 w-full rounded-lg border px-3" />
          </label>
        </div>
        <button className="mt-6 h-12 w-full rounded-lg bg-[#176b50] text-sm font-semibold text-white">
          Confirm transfer
        </button>
      </form>
    </div>
  );
}
