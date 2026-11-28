"use client";

import CustomerTable from "@/components/shared/CustomerTable";
import Panel from "@/components/shared/Panel";
import type { CustomerRow, CustomerTableProps, LoanRow, Notice } from "@/components/shared/types";
import type { Transaction } from "@/store/store";
import AdminAccountsPage from "@/components/bank-workspace/admin/AdminAccountsPage";
import AdminCustomersPage from "@/components/bank-workspace/admin/AdminCustomersPage";
import AdminLoanManagementPage from "@/components/bank-workspace/admin/AdminLoanManagementPage";
import AdminOverviewPage from "@/components/bank-workspace/admin/AdminOverviewPage";
import AdminSettingsPage from "@/components/bank-workspace/admin/AdminSettingsPage";
import AdminTransactionsPage from "@/components/bank-workspace/admin/AdminTransactionsPage";

type AdminDashboardContentProps = Pick<CustomerTableProps, "freeze" | "setFreeze"> & {
  section: string;
  customers: CustomerRow[];
  transactions: Transaction[];
  loanRows: LoanRow[];
  setNotice: Notice;
  onUpdateLoan: (id: string, status: "Approved" | "Rejected") => void;
};

export default function AdminDashboardContent({
  section,
  customers,
  freeze,
  setFreeze,
  transactions,
  loanRows,
  setNotice,
  onUpdateLoan,
}: AdminDashboardContentProps) {
  switch (section) {
    case "overview":
      return <AdminOverviewPage customers={customers} freeze={freeze} setFreeze={setFreeze} />;
    case "customers":
      return <AdminCustomersPage customers={customers} freeze={freeze} setFreeze={setFreeze} setNotice={setNotice} />;
    case "accounts":
      return <AdminAccountsPage customers={customers} freeze={freeze} setFreeze={setFreeze} setNotice={setNotice} />;
    case "transactions":
      return <AdminTransactionsPage transactions={transactions} />;
    case "loan-management":
      return <AdminLoanManagementPage loanRows={loanRows} onUpdateLoan={onUpdateLoan} />;
    case "settings":
      return <AdminSettingsPage setNotice={setNotice} />;
    default:
      return (
        <Panel title="Customer workspace">
          <CustomerTable customers={customers} freeze={freeze} setFreeze={setFreeze} staff={false} />
        </Panel>
      );
  }
}
