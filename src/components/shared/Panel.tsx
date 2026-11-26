"use client";

import type { ReactNode } from "react";

type PanelProps = {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
};

export default function Panel({ title, subtitle, className = "", children }: PanelProps) {
  return (
    <section className={`rounded-2xl border border-[#edf0ee] bg-white p-5 ${className}`}>
      {title && (
        <div className="mb-4">
          <h2 className="font-semibold">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-[#929b96]">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
