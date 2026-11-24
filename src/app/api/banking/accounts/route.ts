import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (session.role === "customer") {
    const accounts = await prisma.account.findMany({
      where: { customerId: String(session.sub) },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ accounts });
  }
  if (session.role === "admin" || session.role === "staff") {
    const accounts = await prisma.account.findMany({
      include: { customer: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ accounts });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
