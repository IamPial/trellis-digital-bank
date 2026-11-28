import { LoanStatus } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

type ReviewStatus = "under_review" | "approved" | "rejected";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ loanId: string }> },
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (session.role !== "admin" && session.role !== "staff") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { loanId } = await params;
  const body = await request.json();
  const status = String(body.status) as ReviewStatus;
  const isStaff = session.role === "staff";
  if (isStaff && status !== "under_review") {
    return NextResponse.json({ error: "Staff may forward applications but cannot approve or reject them" }, { status: 403 });
  }
  if (!["under_review", "approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid loan status" }, { status: 400 });
  }

  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) return NextResponse.json({ error: "Loan application not found" }, { status: 404 });
  if (loan.status !== "pending" && loan.status !== "under_review") {
    return NextResponse.json({ error: "This application has already been finalized" }, { status: 409 });
  }

  const updatedLoan = await prisma.$transaction(async (tx) => {
    let account = null;
    if (status === "approved") {
      account = await tx.account.findFirst({
        where: { customerId: loan.customerId, status: "active" },
        orderBy: { createdAt: "asc" },
      });
      if (!account) throw new Error("NO_ACTIVE_ACCOUNT");
    }

    if (status === "approved" && account) {
      await tx.account.update({
        where: { id: account.id },
        data: { balance: { increment: loan.requestedAmount } },
      });
      await tx.transaction.create({
        data: {
          transactionId: `TXN-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`,
          receiverAccountId: account.id,
          transactionType: "loan_disbursement",
          amount: loan.requestedAmount,
          status: "completed",
          description: `Loan disbursement for ${loan.loanType}`,
        },
      });
      await tx.notification.create({
        data: {
          userId: loan.customerId,
          title: "Loan approved",
          message: `Your ${loan.loanType} for ${loan.requestedAmount.toFixed(2)} was approved and disbursed.`,
        },
      });
    }

    return tx.loan.update({
      where: { id: loanId },
      data: {
        status: status === "approved" ? ("active" as LoanStatus) : (status as LoanStatus),
        ...(body.internalNotes ? { internalNotes: String(body.internalNotes) } : {}),
        ...(status === "approved" ? { approvedAmount: loan.requestedAmount, remainingBalance: loan.requestedAmount } : {}),
      },
    });
  }).catch((error) => {
    if (error instanceof Error && error.message === "NO_ACTIVE_ACCOUNT") {
      return null;
    }
    throw error;
  });

  if (!updatedLoan) {
    return NextResponse.json({ error: "Customer has no active account for loan disbursement" }, { status: 422 });
  }

  return NextResponse.json({ loan: updatedLoan });
}
