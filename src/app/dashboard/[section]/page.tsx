import { Suspense } from "react";
import BankWorkspace from "@/components/BankWorkspace";

async function SectionContent({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return <BankWorkspace section={section}/>;
}

export default function DashboardSectionPage({ params }: { params: Promise<{ section: string }> }) {
  return <Suspense fallback={<div className="min-h-screen bg-[#f6f8f7]" />}><SectionContent params={params}/></Suspense>;
}
