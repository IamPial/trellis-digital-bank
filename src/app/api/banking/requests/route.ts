import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!["customer", "staff", "admin"].includes(String(session.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const requests = await prisma.moneyRequest.findMany({
    where: session.role === "customer" ? { customerId: String(session.sub) } : undefined,
    include: { account: { select: { id: true, accountNumber: true, accountType: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (session.role !== "customer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const accountId = String(body.accountId || "");
  const type = String(body.type);
  const amount = new Prisma.Decimal(String(body.amount));
  if (!accountId || !["deposit", "withdrawal"].includes(type)) {
    return NextResponse.json({ error: "Valid account and request type are required" }, { status: 400 });
  }
  if (!amount.isFinite() || amount.lte(0)) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const account = await prisma.account.findFirst({
    where: { id: accountId, customerId: String(session.sub), status: "active" },
  });
  if (!account) return NextResponse.json({ error: "Active account not found" }, { status: 404 });
  if (type === "withdrawal" && account.balance.lt(amount)) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 422 });
  }

  const moneyRequest = await prisma.moneyRequest.create({
    data: {
      customerId: String(session.sub),
      accountId: account.id,
      type: type as "deposit" | "withdrawal",
      amount,
      description: String(body.description || ""),
    },
  });
  return NextResponse.json({ request: moneyRequest }, { status: 201 });
}
