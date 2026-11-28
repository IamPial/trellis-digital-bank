import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const transactionPin = String(body.transactionPin || "");
    const accountType = String(body.accountType || "savings").toLowerCase();
    const role = String(body.role || "customer").toLowerCase();

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (role !== "customer" && role !== "staff") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (role === "customer" && !/^\d{4}$/.test(transactionPin)) {
      return NextResponse.json({ error: "Transaction PIN must be 4 digits" }, { status: 400 });
    }
    if (role === "customer" && !["savings", "current", "business"].includes(accountType)) {
      return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
    }
    if (await prisma.user.findUnique({ where: { email } })) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const passwordHash = await bcrypt.hash(password, 12);
      const transactionPinHash = role === "customer" ? await bcrypt.hash(transactionPin, 12) : "";
      const user = await tx.user.create({
        data: {
          email,
          fullName,
          passwordHash,
          transactionPinHash,
          role,
        },
      });

      let account = null;
      if (role === "customer") {
        const accountNumber = String(1000000000 + Number(BigInt(`0x${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`) % BigInt(9000000000)));
        account = await tx.account.create({
          data: {
            customerId: user.id,
            accountNumber,
            accountType: accountType as "savings" | "current" | "business",
            balance: 0,
            dailyLimit: 10000,
          },
        });
      }
      return { user, account };
    });

    return NextResponse.json({
      id: result.user.id,
      role: result.user.role,
      name: result.user.fullName,
      email: result.user.email,
      accountNumber: result.account?.accountNumber,
    }, { status: 201 });
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json({ error: "Unable to create account" }, { status: 503 });
  }
}
