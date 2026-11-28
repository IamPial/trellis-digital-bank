import type { Dispatch, SetStateAction } from "react";
import type { Transaction } from "@/store/store";

export type Notice = (message: string, type?: "success" | "error") => void;

export type CustomerRow = {
  id: string;
  name: string;
  email: string;
  account: string;
  type: string;
  status: string;
  balance: number;
};

export type LoanRow = {
  id: string;
  customer: string;
  amount: string;
  type: string;
  status: string;
};

export type CustomerTableProps = {
  customers: CustomerRow[];
  freeze: Record<string, boolean>;
  setFreeze: Dispatch<SetStateAction<Record<string, boolean>>>;
  staff: boolean;
};

export type TransactionsTableProps = {
  transactions: Transaction[];
  className?: string;
};
