"use client";

import Panel from "@/components/shared/Panel";
import type { Notice } from "@/components/shared/types";

export default function AdminSettingsPage({ setNotice }: { setNotice: Notice }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Transaction limits">
        <form onSubmit={(event) => { event.preventDefault(); setNotice("Bank transaction settings updated."); }} className="space-y-4">
          <label className="block text-sm">Daily transfer limit<input defaultValue="10000" type="number" className="mt-2 h-12 w-full rounded-lg border px-3" /></label>
          <label className="block text-sm">Maximum single transaction<input defaultValue="5000" type="number" className="mt-2 h-12 w-full rounded-lg border px-3" /></label>
          <label className="block text-sm">Minimum account balance<input defaultValue="25" type="number" className="mt-2 h-12 w-full rounded-lg border px-3" /></label>
          <button className="h-12 w-full rounded-lg bg-[#176b50] text-sm font-semibold text-white">Save settings</button>
        </form>
      </Panel>
      <Panel title="Suspicious transaction rules">
        <div className="space-y-3">
          {["Transfers above $5,000", "5 or more transfers per hour", "Login from a new device"].map((rule) => (
            <label key={rule} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <span>{rule}</span><input type="checkbox" defaultChecked className="h-4 w-4 accent-[#176b50]" />
            </label>
          ))}
        </div>
      </Panel>
    </div>
  );
}
