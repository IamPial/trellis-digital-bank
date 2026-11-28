import { NextResponse } from "next/server";
import { Prisma, TransactionType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();
  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 20)));
  const skip = (page - 1) * pageSize;

  const transactionType = Object.values(TransactionType).find((value) => value === type);
  const accountFilter: Prisma.TransactionWhereInput = session.role === "customer"
    ? {
        OR: [
          { senderAccount: { is: { customerId: String(session.sub) } } },
          { receiverAccount: { is: { customerId: String(session.sub) } } },
        ],
      }
    : {};
  const where: Prisma.TransactionWhereInput = {
    ...accountFilter,
    ...(query ? { OR: [{ transactionId: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }] } : {}),
    ...(transactionType ? { transactionType } : {}),
    ...(from || to ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}) } } : {}),
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        senderAccount: { select: { accountNumber: true, customer: { select: { id: true, fullName: true } } } },
        receiverAccount: { select: { accountNumber: true, customer: { select: { id: true, fullName: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);
  const transactionsWithDirection = transactions.map((transaction) => {
    const direction = session.role === "customer"
      ? transaction.senderAccount?.customer.id === String(session.sub) ? "debit" : "credit"
      : transaction.receiverAccountId ? "credit" : "debit";
    return { ...transaction, direction };
  });
  return NextResponse.json({ transactions: transactionsWithDirection, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}
