import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (session.role === "customer") {
    const loans = await prisma.loan.findMany({ where: { customerId: String(session.sub) }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ loans });
  }
  if (session.role === "admin" || session.role === "staff") {
    const loans = await prisma.loan.findMany({ include: { customer: { select: { id: true, fullName: true, email: true } } }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ loans });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (session.role !== "customer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const amount = Number(body.requestedAmount);
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Invalid loan amount" }, { status: 400 });
  const loan = await prisma.loan.create({
    data: {
      customerId: String(session.sub),
      loanType: String(body.loanType),
      requestedAmount: amount,
      loanDurationMonths: Number(body.loanDurationMonths),
      monthlyIncome: Number(body.monthlyIncome) || null,
      employmentStatus: String(body.employmentStatus || ""),
      description: String(body.description || ""),
    },
  });
  return NextResponse.json({ loan }, { status: 201 });
}
