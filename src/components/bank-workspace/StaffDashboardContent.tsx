"use client";

import CustomerTable from "@/components/shared/CustomerTable";
import Panel from "@/components/shared/Panel";
import type { CustomerRow, CustomerTableProps, Notice } from "@/components/shared/types";
import type { Transaction } from "@/store/store";
import StaffCustomersPage from "./staff/StaffCustomersPage";
import StaffLoanReviewPage from "./staff/StaffLoanReviewPage";
import StaffOverviewPage from "./staff/StaffOverviewPage";
import StaffPendingRequestsPage from "./staff/StaffPendingRequestsPage";
import StaffTransactionsPage from "./staff/StaffTransactionsPage";
import type { StaffLoanRow } from "./staff/types";

type StaffDashboardContentProps = Pick<CustomerTableProps, "freeze" | "setFreeze"> & {
  section: string;
  customers: CustomerRow[];
  loanRows: StaffLoanRow[];
  transactions: Transaction[];
  setNotice: Notice;
  onForwardLoan: (id: string) => void;
};

export default function StaffDashboardContent({
  section,
  customers,
  freeze,
  setFreeze,
  loanRows,
  transactions,
  setNotice,
  onForwardLoan,
}: StaffDashboardContentProps) {
  const flagTransaction = () => setNotice("Transaction flagged for admin review.");

  switch (section) {
    case "overview":
      return <StaffOverviewPage customers={customers} freeze={freeze} setFreeze={setFreeze} />;
    case "customers":
      return <StaffCustomersPage customers={customers} freeze={freeze} setFreeze={setFreeze} setNotice={setNotice} />;
    case "transactions":
      return <StaffTransactionsPage transactions={transactions} onFlag={flagTransaction} />;
    case "pending-requests":
      return <StaffPendingRequestsPage transactions={transactions} onFlag={flagTransaction} />;
    case "loan-review":
      return <StaffLoanReviewPage loanRows={loanRows} onForward={onForwardLoan} />;
    default:
      return (
        <Panel title="Customer workspace">
          <CustomerTable customers={customers} freeze={freeze} setFreeze={setFreeze} staff />
        </Panel>
      );
  }
}
