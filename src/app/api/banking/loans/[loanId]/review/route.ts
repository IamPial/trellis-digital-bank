import { LoanStatus } from "@prisma/client";
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

  const updatedLoan = await prisma.loan.update({
    where: { id: loanId },
    data: {
      status: status as LoanStatus,
      ...(body.internalNotes ? { internalNotes: String(body.internalNotes) } : {}),
      ...(status === "approved" ? { approvedAmount: loan.requestedAmount, remainingBalance: loan.requestedAmount } : {}),
    },
  });

  return NextResponse.json({ loan: updatedLoan });
}
