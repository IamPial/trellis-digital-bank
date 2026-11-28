import { NextResponse } from "next/server";
import { MoneyRequestStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> },
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (session.role !== "admin" && session.role !== "staff") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { requestId } = await params;
  const body = await request.json();
  const status = String(body.status);
  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid request status" }, { status: 400 });
  }

  const moneyRequest = await prisma.moneyRequest.findUnique({ where: { id: requestId }, include: { account: true } });
  if (!moneyRequest) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (moneyRequest.status !== "pending") return NextResponse.json({ error: "Request has already been reviewed" }, { status: 409 });
  if (moneyRequest.type === "withdrawal" && status === "approved" && moneyRequest.account.balance.lt(moneyRequest.amount)) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 422 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (status === "approved") {
      await tx.account.update({
        where: { id: moneyRequest.accountId },
        data: moneyRequest.type === "deposit"
          ? { balance: { increment: moneyRequest.amount } }
          : { balance: { decrement: moneyRequest.amount } },
      });
      await tx.transaction.create({
        data: {
          transactionId: `TXN-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`,
          ...(moneyRequest.type === "deposit"
            ? { receiverAccountId: moneyRequest.accountId }
            : { senderAccountId: moneyRequest.accountId }),
          transactionType: moneyRequest.type,
          amount: moneyRequest.amount,
          status: "completed",
          description: moneyRequest.description || `${moneyRequest.type} request approved`,
        },
      });
      await tx.notification.create({
        data: {
          userId: moneyRequest.customerId,
          title: `${moneyRequest.type === "deposit" ? "Deposit" : "Withdrawal"} approved`,
          message: `Your ${moneyRequest.type} request for ${moneyRequest.amount.toFixed(2)} was approved.`,
        },
      });
    } else {
      await tx.notification.create({
        data: {
          userId: moneyRequest.customerId,
          title: `${moneyRequest.type === "deposit" ? "Deposit" : "Withdrawal"} rejected`,
          message: `Your ${moneyRequest.type} request for ${moneyRequest.amount.toFixed(2)} was rejected.`,
        },
      });
    }
    return tx.moneyRequest.update({
      where: { id: requestId },
      data: { status: status as MoneyRequestStatus, reviewedById: String(session.sub), reviewedAt: new Date() },
    });
  });
  return NextResponse.json({ request: updated });
}
