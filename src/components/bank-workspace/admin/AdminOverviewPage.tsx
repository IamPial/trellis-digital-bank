"use client";

import { CircleDollarSign, Landmark, Users, WalletCards } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "@/components/shared/Card";
import CustomerTable from "@/components/shared/CustomerTable";
import Panel from "@/components/shared/Panel";
import type { CustomerRow, CustomerTableProps } from "@/components/shared/types";

type AdminOverviewPageProps = Pick<CustomerTableProps, "freeze" | "setFreeze"> & {
  customers: CustomerRow[];
};

const activity = [
  { name: "Jun", income: 5200, spending: 3100 },
  { name: "Jul", income: 6100, spending: 3900 },
  { name: "Aug", income: 5800, spending: 3400 },
  { name: "Sep", income: 7200, spending: 4100 },
  { name: "Oct", income: 6800, spending: 3700 },
  { name: "Nov", income: 8400, spending: 4300 },
];

export default function AdminOverviewPage({
  customers,
  freeze,
  setFreeze,
}: AdminOverviewPageProps) {
  return (
    <div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Registered customers" value="2,842" change="+8.4% this month" icon={Users} />
        <Card title="Total bank accounts" value="4,617" change="+6.1% this month" icon={WalletCards} />
        <Card title="Total bank balance" value="$12.4M" change="+4.8% this month" icon={CircleDollarSign} />
        <Card title="Pending loans" value="18" change="Review required" icon={Landmark} />
      </section>
      <Panel title="Monthly banking activity" className="mt-5">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activity}>
              <defs>
                <linearGradient id="adminActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#277d62" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#277d62" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="income" stroke="#277d62" strokeWidth={2} fill="url(#adminActivity)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <Panel title="Recent customers" className="mt-5">
        <CustomerTable customers={customers} freeze={freeze} setFreeze={setFreeze} staff={false} />
      </Panel>
    </div>
  );
}
