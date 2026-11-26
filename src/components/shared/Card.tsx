"use client";

import type { LucideIcon } from "lucide-react";

type CardProps = {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
};

export default function Card({ title, value, change, icon: Icon }: CardProps) {
  return (
    <div className="min-h-36.25 rounded-2xl border border-[#edf0ee] bg-white p-5">
      <div className="flex justify-between">
        <span className="text-sm text-[#7e8983]">{title}</span>
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#edf5f1] text-[#277d62]">
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-xs text-[#277d62]">{change}</p>
    </div>
  );
}
