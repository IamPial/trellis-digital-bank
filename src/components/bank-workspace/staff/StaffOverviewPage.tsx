"use client";

import { CircleDollarSign, Landmark, Users, WalletCards } from "lucide-react";
import Card from "@/components/shared/Card";
import CustomerTable from "@/components/shared/CustomerTable";
import Panel from "@/components/shared/Panel";
import type { CustomerRow } from "@/components/shared/types";
import type { CustomerTableProps } from "@/components/shared/types";

type StaffOverviewPageProps = Pick<CustomerTableProps, "freeze" | "setFreeze"> & {
  customers: CustomerRow[];
};

export default function StaffOverviewPage({
  customers,
  freeze,
  setFreeze,
}: StaffOverviewPageProps) {
  return (
    <div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Registered customers" value="2,842" change="+8.4% this month" icon={Users} />
        <Card title="Total bank accounts" value="4,617" change="+6.1% this month" icon={WalletCards} />
        <Card title="Total bank balance" value="$12.4M" change="+4.8% this month" icon={CircleDollarSign} />
        <Card title="Pending requests" value="12" change="Review required" icon={Landmark} />
      </section>
      <Panel title="Customer operations" className="mt-5">
        <CustomerTable customers={customers} freeze={freeze} setFreeze={setFreeze} staff />
      </Panel>
    </div>
  );
}
