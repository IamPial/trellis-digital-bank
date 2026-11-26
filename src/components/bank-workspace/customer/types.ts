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
