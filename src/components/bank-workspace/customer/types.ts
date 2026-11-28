export type AccountView = {
  id: string;
  key: "checking" | "savings" | "business";
  label: string;
  last: string;
  balance: number;
  type: string;
  status: string;
  limit: string;
};

export type CashFlowMonth = { name: string; income: number; spending: number };

export type CustomerLoan = {
  id: string;
  loanType: string;
  requestedAmount: number | string;
  loanDurationMonths: number;
  status: string;
  approvedAmount: number | string | null;
  remainingBalance: number | string | null;
  createdAt: string;
};
