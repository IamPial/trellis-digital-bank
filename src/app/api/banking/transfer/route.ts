import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("trellis_session")?.value;
    if (!token) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "trellis-development-secret-change-me");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "customer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const amount = new Prisma.Decimal(String(body.amount));
    const recipientNumber = String(body.recipient || "").replace(/\D/g, "");
    const pin = String(body.pin || "");
    const senderAccountId = String(body.senderAccountId || "");
    if (!amount.isFinite() || amount.lte(0)) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    if (!/^\d{4}$/.test(pin)) return NextResponse.json({ error: "Valid 4-digit PIN required" }, { status: 400 });
    if (!recipientNumber) return NextResponse.json({ error: "Recipient account required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: String(payload.sub) } });
    if (!user || !(await bcrypt.compare(pin, user.transactionPinHash))) {
      return NextResponse.json({ error: "Invalid transaction PIN" }, { status: 401 });
    }

    const sender = senderAccountId
      ? await prisma.account.findFirst({ where: { id: senderAccountId, customerId: user.id, status: "active" } })
      : await prisma.account.findFirst({ where: { customerId: user.id, status: "active" }, orderBy: { createdAt: "asc" } });
    if (!sender) return NextResponse.json({ error: "No active account found" }, { status: 422 });

    const recipient = await prisma.account.findUnique({ where: { accountNumber: recipientNumber } });
    if (!recipient) return NextResponse.json({ error: "Recipient account not found" }, { status: 404 });
    if (recipient.status !== "active") return NextResponse.json({ error: "Recipient account is unavailable" }, { status: 422 });
    const result = await prisma.$transaction(async (tx) => {
      const senderLocked = await tx.account.findUnique({ where: { id: sender.id } });
      if (!senderLocked || senderLocked.status !== "active") throw new Error("SENDER_UNAVAILABLE");
      if (senderLocked.balance.lt(amount)) throw new Error("INSUFFICIENT_BALANCE");
      if (amount.gt(senderLocked.dailyLimit)) throw new Error("DAILY_LIMIT_EXCEEDED");

      await tx.account.update({ where: { id: senderLocked.id }, data: { balance: { decrement: amount } } });
      await tx.account.update({ where: { id: recipient.id }, data: { balance: { increment: amount } } });

      const transactionId = `TXN-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
      await tx.transaction.create({
        data: {
          transactionId,
          senderAccountId: senderLocked.id,
          receiverAccountId: recipient.id,
          transactionType: "fund_transfer",
          amount,
          status: "completed",
          description: String(body.description || "Fund transfer"),
        },
      });
      await tx.notification.create({
        data: {
          userId: recipient.customerId,
          title: "Money received",
          message: `You received ${amount.toFixed(2)} in account •••• ${recipient.accountNumber.slice(-4)}.`,
        },
      });
      return transactionId;
    });

    return NextResponse.json({ transactionId: result, status: "Completed" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INSUFFICIENT_BALANCE") return NextResponse.json({ error: "Insufficient balance" }, { status: 422 });
      if (error.message === "DAILY_LIMIT_EXCEEDED") return NextResponse.json({ error: "Transfer exceeds your account limit" }, { status: 422 });
    }
    console.error("Transfer failed", error);
    return NextResponse.json({ error: "Transfer could not be completed" }, { status: 500 });
  }
}
