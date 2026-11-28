"use client";

import AccountsPage from "@/components/bank-workspace/customer/AccountsPage";
import LoansPage from "@/components/bank-workspace/customer/LoansPage";
import OverviewPage from "@/components/bank-workspace/customer/OverviewPage";
import StatementsPage from "@/components/bank-workspace/customer/StatementsPage";
import TransactionsPage from "@/components/bank-workspace/customer/TransactionsPage";
import TransfersPage from "@/components/bank-workspace/customer/TransfersPage";
import useCustomerDashboard from "@/components/bank-workspace/customer/useCustomerDashboard";
import TransactionsTable from "@/components/shared/TransactionsTable";
import type { Notice } from "@/components/shared/types";

type CustomerContentProps = {
  section: string;
  setNotice: Notice;
};

export default function CustomerContent({ section, setNotice }: CustomerContentProps) {
  const dashboard = useCustomerDashboard(setNotice, section);

  switch (section) {
    case "overview":
      return (
        <OverviewPage
          accounts={dashboard.accounts}
          selectedAccount={dashboard.selectedAccount}
          transactions={dashboard.transactions}
          cashFlowData={dashboard.cashFlowData}
          transferOpen={dashboard.transferOpen}
          onSelectAccount={dashboard.selectAccount}
          onOpenTransfer={dashboard.openTransfer}
          onCloseTransfer={dashboard.closeTransfer}
          onSubmitTransfer={dashboard.submitTransfer}
        />
      );
    case "accounts":
      return (
        <AccountsPage
          accounts={dashboard.accounts}
          accountQuery={dashboard.accountQuery}
          requestOpen={dashboard.requestOpen}
          onAccountQueryChange={dashboard.setAccountQuery}
          onOpenRequest={dashboard.openRequest}
          onCloseRequest={dashboard.closeRequest}
          onSubmitRequest={dashboard.submitRequest}
        />
      );
    case "transactions":
      return <TransactionsPage transactions={dashboard.transactions} />;
    case "transfers":
      return <TransfersPage onSubmitTransfer={dashboard.submitTransfer} />;
    case "loans":
      return (
        <LoansPage
          loans={dashboard.loans}
          loansLoading={dashboard.loansLoading}
          loanOpen={dashboard.loanOpen}
          loanSubmitting={dashboard.loanSubmitting}
          onOpenLoan={dashboard.openLoan}
          onCloseLoan={dashboard.closeLoan}
          onSubmitLoan={dashboard.submitLoan}
        />
      );
    case "statements":
      return (
        <StatementsPage
          transactions={dashboard.transactions}
          onDownloadStatement={dashboard.downloadStatement}
        />
      );
    default:
      return <TransactionsTable transactions={dashboard.transactions} />;
  }
}
