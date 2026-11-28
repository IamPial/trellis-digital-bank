"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import type { CustomerRow, LoanRow, Notice } from "@/components/shared/types";
import StaffDashboardContent from "@/components/bank-workspace/StaffDashboardContent";
import AdminDashboardContent from "@/components/bank-workspace/AdminDashboardContent";

type OperationsContentProps = {
  role: "admin" | "staff";
  section: string;
  setNotice: Notice;
};

type LoanResponse = {
  id: string;
  customer?: { fullName: string };
  loanType: string;
  requestedAmount: string | number;
  status: string;
};

type CustomerResponse = {
  id: string;
  fullName: string;
  email: string;
  status: string;
  accounts: { accountNumber: string; accountType: string; balance: number | string }[];
};

const customersSeed: CustomerRow[] = [
  { id: "CUS-1042", name: "Jamie Parker", email: "jamie@trellis.bank", account: "4821", type: "Savings", status: "Active", balance: 24680.45 },
  { id: "CUS-1048", name: "Sophia Carter", email: "sophia@trellis.bank", account: "1098", type: "Current", status: "Active", balance: 18240.2 },
  { id: "CUS-1054", name: "Marcus Chen", email: "marcus@trellis.bank", account: "7734", type: "Business", status: "Review", balance: 5420.1 },
];

export default function OperationsContent({ role, section, setNotice }: OperationsContentProps) {
  const transactions = useAppSelector((state) => state.transactions.items);
  const [customers, setCustomers] = useState(customersSeed);
  const [loanRows, setLoanRows] = useState<LoanRow[]>([]);
  const [freeze, setFreeze] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/banking/customers")
      .then(async (response) => response.ok
        ? (await response.json()) as { customers: CustomerResponse[] }
        : null)
      .then((data) => {
        if (!data?.customers) return;
        setCustomers(data.customers.map((customer, index) => {
          const account = customer.accounts[0];
          return {
            id: customer.id,
            name: customer.fullName,
            email: customer.email,
            account: account?.accountNumber.slice(-4) || String(index + 1000),
            type: account?.accountType
              ? `${account.accountType.charAt(0).toUpperCase()}${account.accountType.slice(1)}`
              : "Savings",
            status: customer.status === "active" ? "Active" : "Review",
            balance: Number(account?.balance || 0),
          };
        }));
      })
      .catch(() => undefined);

    if (section !== "loan-review" && section !== "loan-management") return;
    fetch("/api/banking/loans")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load loan applications");
        return response.json() as Promise<{ loans: LoanResponse[] }>;
      })
      .then(({ loans }) => setLoanRows(loans.map((loan) => ({
        id: loan.id,
        customer: loan.customer?.fullName || "Customer",
        amount: `$${Number(loan.requestedAmount).toLocaleString()}`,
        type: loan.loanType,
        status: loan.status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
      }))))
      .catch(() => setNotice("Unable to load loan applications.", "error"));
  }, [section, setNotice]);

  const updateLoan = async (id: string, status: "Approved" | "Rejected" | "Under Review") => {
    const response = await fetch(`/api/banking/loans/${id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status === "Under Review" ? "under_review" : status.toLowerCase() }),
    });
    const result = await response.json();
    if (!response.ok) {
      setNotice(result.error || "Unable to update loan application.", "error");
      return;
    }
    setLoanRows((rows) => rows.map((row) => row.id === id ? { ...row, status } : row));
    setNotice(role === "staff" ? "Application forwarded to the admin for approval." : `Loan application ${status.toLowerCase()}.`);
  };

  if (role === "staff") {
    return (
      <StaffDashboardContent
        section={section}
        customers={customers}
        freeze={freeze}
        setFreeze={setFreeze}
        loanRows={loanRows}
        transactions={transactions}
        setNotice={setNotice}
        onForwardLoan={(id) => updateLoan(id, "Under Review")}
      />
    );
  }

  return (
    <AdminDashboardContent
      section={section}
      customers={customers}
      freeze={freeze}
      setFreeze={setFreeze}
      transactions={transactions}
      loanRows={loanRows}
      setNotice={setNotice}
      onUpdateLoan={updateLoan}
    />
  );
}
