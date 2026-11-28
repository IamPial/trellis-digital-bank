"use client";

import { configureStore, createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Role = "admin" | "staff" | "customer";

interface AuthState { role: Role | null; name: string; status: "idle" | "loading" | "authenticated"; }
const authSlice = createSlice({
  name: "auth",
  initialState: { role: null, name: "", status: "idle" } as AuthState,
  reducers: {
    setAuth: (state, action: PayloadAction<{role: Role; name: string}>) => {
      state.role = action.payload.role; state.name = action.payload.name; state.status = "authenticated";
    },
    clearAuth: (state) => { state.role = null; state.name = ""; state.status = "idle"; },
  },
});

export interface Transaction {
  id: string; name: string; detail: string; amount: number; type: "credit" | "debit";
  status: "Completed" | "Pending" | "Failed"; date: string;
}
interface TransactionState { items: Transaction[]; loading: boolean; error: string | null; }
const transactionSlice = createSlice({
  name: "transactions",
  initialState: {
    items: [
      { id: "TXN-784290", name: "Salary deposit", detail: "Acme Corporation", amount: 4800, type: "credit", status: "Completed", date: "Nov 24, 2026" },
      { id: "TXN-784281", name: "Coffee shop", detail: "Card payment", amount: -18.50, type: "debit", status: "Completed", date: "Nov 23, 2026" },
      { id: "TXN-784276", name: "Transfer to Emma", detail: "External transfer", amount: -250, type: "debit", status: "Completed", date: "Nov 22, 2026" },
      { id: "TXN-784265", name: "Mobile top-up", detail: "Telecom", amount: -35, type: "debit", status: "Pending", date: "Nov 21, 2026" },
    ],
    loading: false, error: null,
  } as TransactionState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Transaction>) => { state.items.unshift(action.payload); },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Unable to load transactions"; });
  },
});

interface AccountState { selected: "checking" | "savings" | "business"; loading: boolean; error: string | null; }
const accountSlice = createSlice({
  name: "accounts",
  initialState: { selected: "checking", loading: false, error: null } as AccountState,
  reducers: {
    selectAccount: (state, action: PayloadAction<AccountState["selected"]>) => { state.selected = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAccounts.fulfilled, (state) => { state.loading = false; state.error = null; })
      .addCase(fetchAccounts.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Unable to load accounts"; });
  },
});

interface LoanState { status: "idle" | "loading" | "success"; applications: number; }
const loanSlice = createSlice({
  name: "loans",
  initialState: { status: "idle", applications: 4 } as LoanState,
  reducers: {
    setLoanStatus: (state, action: PayloadAction<LoanState["status"]>) => { state.status = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoans.pending, (state) => { state.status = "loading"; })
      .addCase(fetchLoans.fulfilled, (state, action) => { state.status = "success"; state.applications = action.payload.length; })
      .addCase(fetchLoans.rejected, (state) => { state.status = "idle"; });
  },
});

export const fetchTransactions = createAsyncThunk("transactions/fetch", async () => {
  const response = await fetch("/api/banking/transactions");
  if (!response.ok) throw new Error("Unable to load transactions");
  const data = await response.json() as {
    transactions: {
      transactionId: string;
      description: string | null;
      transactionType: string;
      amount: number | string;
      direction: "credit" | "debit";
      status: string;
      createdAt: string;
    }[];
  };
  return data.transactions.map((transaction): Transaction => ({
    id: transaction.transactionId,
    name: transaction.description || transaction.transactionType.replaceAll("_", " "),
    detail: transaction.transactionType.replaceAll("_", " "),
    amount: Math.abs(Number(transaction.amount)) * (transaction.direction === "credit" ? 1 : -1),
    type: transaction.direction,
    status: transaction.status === "completed" ? "Completed" : transaction.status === "pending" ? "Pending" : "Failed",
    date: new Date(transaction.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  }));
});

export const fetchAccounts = createAsyncThunk("accounts/fetch", async () => {
  const response = await fetch("/api/banking/accounts");
  if (!response.ok) throw new Error("Unable to load accounts");
  return response.json();
});

export const fetchLoans = createAsyncThunk("loans/fetch", async () => {
  const response = await fetch("/api/banking/loans");
  if (!response.ok) throw new Error("Unable to load loans");
  const data = await response.json() as { loans: unknown[] };
  return data.loans;
});

export const { setAuth, clearAuth } = authSlice.actions;
export const { addTransaction } = transactionSlice.actions;
export const { selectAccount } = accountSlice.actions;
export const { setLoanStatus } = loanSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    transactions: transactionSlice.reducer,
    accounts: accountSlice.reducer,
    loans: loanSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
