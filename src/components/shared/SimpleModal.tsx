"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

type SimpleModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export default function SimpleModal({ title, onClose, children }: SimpleModalProps) {
  return (
    <div className="fixed inset-0 z-70 grid place-items-center bg-[#102019]/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#f2f4f3]">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
