"use client";

import { use } from "react";
import BankWorkspace from "@/components/BankWorkspace";

export default function DashboardSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = use(params);
  return <BankWorkspace section={section}/>;
}
