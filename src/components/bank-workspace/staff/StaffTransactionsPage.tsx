"use client";

import StaffActivityPage from "./StaffActivityPage";
import type { Transaction } from "@/store/store";

type StaffTransactionsPageProps = {
  transactions: Transaction[];
  onFlag: () => void;
};

export default function StaffTransactionsPage(props: StaffTransactionsPageProps) {
  return <StaffActivityPage {...props} />;
}
