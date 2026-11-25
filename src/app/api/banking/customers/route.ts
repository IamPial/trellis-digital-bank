import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (session.role !== "admin" && session.role !== "staff") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    where: { role: "customer" },
    include: { accounts: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ customers: users });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (session.role !== "admin" && session.role !== "staff") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const accountType = String(body.accountType || "").toLowerCase();
  const initialDeposit = Number(body.initialDeposit || 0);
  if (!["savings", "current", "business"].includes(accountType)) {
    return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
  }
  if (!Number.isFinite(initialDeposit) || initialDeposit < 0) {
    return NextResponse.json({ error: "Invalid initial deposit" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    let customer = null;
    if (String(body.customerId || "")) {
      customer = await tx.user.findUnique({ where: { id: String(body.customerId) } });
    } else if (String(body.email || "").trim()) {
      const email = String(body.email).trim().toLowerCase();
      customer = await tx.user.findUnique({ where: { email } });
      if (!customer) {
        const passwordHash = await bcrypt.hash(String(body.password || "trellisdemo"), 12);
        const pinHash = await bcrypt.hash(String(body.transactionPin || "1234"), 12);
        customer = await tx.user.create({
          data: {
            email,
            fullName: String(body.fullName || email),
            passwordHash,
            transactionPinHash: pinHash,
            role: "customer",
          },
        });
      }
    } else if (String(body.fullName || "").trim()) {
      const generatedEmail = `customer-${crypto.randomUUID().slice(0, 8)}@trellis.bank`;
      customer = await tx.user.create({
        data: {
          email: generatedEmail,
          fullName: String(body.fullName),
          passwordHash: await bcrypt.hash(String(body.password || "trellisdemo"), 12),
          transactionPinHash: await bcrypt.hash(String(body.transactionPin || "1234"), 12),
          role: "customer",
        },
      });
    }
    if (!customer || customer.role !== "customer") {
      throw new Error("CUSTOMER_REQUIRED");
    }

    const accountNumber = String(Math.floor(1000000000 + crypto.randomUUID().slice(0, 10).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 9000000000));
    return tx.account.create({
      data: {
        customerId: customer.id,
        accountNumber,
        accountType: accountType as "savings" | "current" | "business",
        balance: initialDeposit,
        dailyLimit: Number(body.dailyLimit || 10000),
      },
      include: { customer: { select: { id: true, fullName: true, email: true } } },
    });
  });
  return NextResponse.json({ account: result }, { status: 201 });
}
