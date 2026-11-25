import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ accountId: string }> },
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (session.role !== "admin" && session.role !== "staff") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { accountId } = await params;
  const body = await request.json();
  const data: { status?: "active" | "frozen" | "blocked"; dailyLimit?: number; accountType?: "savings" | "current" | "business" } = {};
  if (body.status) {
    if (!["active", "frozen", "blocked"].includes(String(body.status))) {
      return NextResponse.json({ error: "Invalid account status" }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.dailyLimit !== undefined) {
    const dailyLimit = Number(body.dailyLimit);
    if (!Number.isFinite(dailyLimit) || dailyLimit < 0) return NextResponse.json({ error: "Invalid daily limit" }, { status: 400 });
    data.dailyLimit = dailyLimit;
  }
  if (body.accountType) {
    if (!["savings", "current", "business"].includes(String(body.accountType))) {
      return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
    }
    data.accountType = body.accountType;
  }
  if (!Object.keys(data).length) return NextResponse.json({ error: "No account changes provided" }, { status: 400 });
  const account = await prisma.account.update({ where: { id: accountId }, data });
  return NextResponse.json({ account });
}
