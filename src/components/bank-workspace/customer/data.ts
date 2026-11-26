import type { Transaction } from "@/store/store";
import type { AccountView, CashFlowMonth } from "./types";

export type AccountResponse = {
  id: string;
  accountType: string;
  accountNumber: string;
  balance: number | string;
  status: string;
  dailyLimit: number | string;
};

export function mapAccounts(accounts: AccountResponse[]): AccountView[] {
  return accounts.map((account, index) => {
    const accountType = account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1);
    return {
      id: account.id,
      key: (["checking", "savings", "business"][index] || "business") as AccountView["key"],
      label: accountType,
      last: account.accountNumber.slice(-4),
      balance: Number(account.balance),
      type: `${accountType} Account`,
      status: account.status === "active" ? "Active" : account.status,
      limit: `${Number(account.dailyLimit).toLocaleString()}/day`,
    };
  });
}

export function getCashFlowData(transactions: Transaction[]): CashFlowMonth[] {
  const dates = transactions
    .map((transaction) => new Date(transaction.date))
    .filter((date) => !Number.isNaN(date.getTime()));
  if (!dates.length) return [];

  const latest = dates.reduce((current, date) => date > current ? date : current);
  return Array.from({ length: 6 }, (_, index) => {
    const month = new Date(latest.getFullYear(), latest.getMonth() - 5 + index, 1);
    const monthlyTransactions = transactions.filter((transaction) => {
      const date = new Date(transaction.date);
      return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
    });
    return {
      name: month.toLocaleString("en-US", { month: "short" }),
      income: monthlyTransactions
        .filter((transaction) => transaction.amount > 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0),
      spending: monthlyTransactions
        .filter((transaction) => transaction.amount < 0)
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    };
  });
}
