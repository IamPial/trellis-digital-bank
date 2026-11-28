"use client";

import { useEffect, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addTransaction,
  fetchTransactions,
  selectAccount,
} from "@/store/store";
import type { Notice } from "@/components/shared/types";
import { getCashFlowData, mapAccounts, type AccountResponse } from "./data";
import type { AccountView, CustomerLoan } from "./types";

const initialAccounts: AccountView[] = [
  { id: "", key: "checking", label: "Checking", last: "4821", balance: 24680.45, type: "Savings Account", status: "Active", limit: "$10,000/day" },
  { id: "", key: "savings", label: "Savings", last: "1098", balance: 18240.2, type: "Savings Account", status: "Active", limit: "$5,000/day" },
  { id: "", key: "business", label: "Business", last: "7734", balance: 5420.1, type: "Business Account", status: "Active", limit: "$25,000/day" },
];

export default function useCustomerDashboard(setNotice: Notice, section: string) {
  const dispatch = useAppDispatch();
  const transactions = useAppSelector((state) => state.transactions.items);
  const selectedAccount = useAppSelector((state) => state.accounts.selected);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [accountQuery, setAccountQuery] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);
  const [loans, setLoans] = useState<CustomerLoan[]>([]);
  const [loansLoading, setLoansLoading] = useState(true);
  const [loanSubmitting, setLoanSubmitting] = useState(false);

  useEffect(() => {
    const refreshCustomerData = async () => {
      const [accountsResponse, loansResponse] = await Promise.all([
        fetch("/api/banking/accounts", { cache: "no-store" }),
        fetch("/api/banking/loans", { cache: "no-store" }),
      ]);
      if (!accountsResponse.ok || !loansResponse.ok) {
        throw new Error("Unable to refresh your account and loan details.");
      }

      const [accountData, loanData] = await Promise.all([
        accountsResponse.json() as Promise<{ accounts: AccountResponse[] }>,
        loansResponse.json() as Promise<{ loans: CustomerLoan[] }>,
      ]);
      setAccounts(mapAccounts(accountData.accounts));
      setLoans(loanData.loans);
      setLoansLoading(false);
      dispatch(fetchTransactions());
    };

    const refresh = () => {
      void refreshCustomerData().catch(() => {
        setLoansLoading(false);
        setNotice("Unable to refresh your account and loan details.", "error");
      });
    };

    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [dispatch, section, setNotice]);

  const submitTransfer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const recipient = String(form.get("recipient") || "");
    const amount = Number(form.get("amount"));
    const pin = String(form.get("pin") || "");
    const description = String(form.get("description") || "");
    const senderAccount = accounts.find((account) => account.key === selectedAccount);
    if (!recipient || !Number.isFinite(amount) || amount <= 0 || !/^\d{4}$/.test(pin)) {
      setNotice("Enter a valid recipient, amount, and 4-digit PIN.", "error");
      return;
    }

    //for balance transferring
    const response = await fetch("/api/banking/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient, amount, pin, description, senderAccountId: senderAccount?.id }),
    });
    const result = await response.json();
    if (!response.ok) {
      setNotice(result.error || "Transfer failed.", "error");
      return;
    }

    dispatch(addTransaction({
      id: result.transactionId,
      name: `Transfer to ${recipient}`,
      detail: "Fund transfer",
      amount: -amount,
      type: "debit",
      status: "Completed",
      date: format(new Date(), "MMM d, yyyy"),
    }));
    setTransferOpen(false);
    setNotice(`Transfer completed. Reference: ${result.transactionId}`);
  };

  //for submit request
  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/banking/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId: String(form.get("accountId") || ""),
        type: String(form.get("type") || ""),
        amount: Number(form.get("amount")),
        description: String(form.get("description") || ""),
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setNotice(result.error || "Unable to submit request.", "error");
      return;
    }
    setRequestOpen(false);
    setNotice("Request submitted and is awaiting approval.");
  };

  //for loans
  const submitLoan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoanSubmitting(true);
    try {
      const response = await fetch("/api/banking/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanType: String(form.get("loanType") || "Personal Loan"),
          requestedAmount: Number(form.get("amount")),
          loanDurationMonths: Number(form.get("duration")),
          monthlyIncome: Number(form.get("income")),
          employmentStatus: String(form.get("employment") || "Employed"),
          description: String(form.get("description") || ""),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setNotice(result.error || "Loan application could not be submitted.", "error");
        return;
      }
      setLoans((currentLoans) => [result.loan as CustomerLoan, ...currentLoans]);
      setLoanOpen(false);
      setNotice("Loan application submitted for review.");
    } catch {
      setNotice("Loan application could not be submitted. Check your connection and try again.", "error");
    } finally {
      setLoanSubmitting(false);
    }
  };


  //for download statement
  const downloadStatement = () => {
    const csv = "Transaction ID,Description,Amount,Status,Date\n"
      + transactions.map((transaction) => `${transaction.id},${transaction.name},${transaction.amount},${transaction.status},${transaction.date}`).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "trellis-account-statement.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    accounts,
    accountQuery,
    cashFlowData: getCashFlowData(transactions),
    loanOpen,
    loans,
    loansLoading,
    loanSubmitting,
    requestOpen,
    selectedAccount,
    transactions,
    transferOpen,
    closeLoan: () => setLoanOpen(false),
    closeRequest: () => setRequestOpen(false),
    closeTransfer: () => setTransferOpen(false),
    downloadStatement,
    openLoan: () => setLoanOpen(true),
    openRequest: () => setRequestOpen(true),
    openTransfer: () => setTransferOpen(true),
    selectAccount: (account: AccountView["key"]) => dispatch(selectAccount(account)),
    setAccountQuery,
    submitLoan,
    submitRequest,
    submitTransfer,
  };
}
