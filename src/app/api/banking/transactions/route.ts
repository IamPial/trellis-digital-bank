import { NextResponse } from "next/server";
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

  const accountFilter = session.role === "customer"
    ? {
        OR: [
          { senderAccount: { customerId: String(session.sub) } },
          { receiverAccount: { customerId: String(session.sub) } },
        ],
      }
    : {};
  const transactionTypes = ["deposit", "withdrawal", "fund_transfer", "loan_disbursement", "loan_repayment"];
  const where: any = {
    ...accountFilter,
    ...(query ? { OR: [{ transactionId: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }] } : {}),
    ...(type && transactionTypes.includes(type) ? { transactionType: type } : {}),
    ...(from || to ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}) } } : {}),
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        senderAccount: { select: { accountNumber: true, customer: { select: { fullName: true } } } },
        receiverAccount: { select: { accountNumber: true, customer: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);
  return NextResponse.json({ transactions, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}
