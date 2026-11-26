"use client";

import StaffActivityPage from "./StaffActivityPage";
import type { Transaction } from "@/store/store";

type StaffPendingRequestsPageProps = {
  transactions: Transaction[];
  onFlag: () => void;
};

export default function StaffPendingRequestsPage(props: StaffPendingRequestsPageProps) {
  return <StaffActivityPage {...props} />;
}
