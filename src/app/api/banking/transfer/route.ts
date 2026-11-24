import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const accounts = new Map([
  ["4821", 24680.45],
  ["1098", 18240.2],
  ["7734", 5420.1],
]);

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get("trellis_role")?.value !== "customer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const amount = Number(body.amount);
  const sender = "4821";
  const recipient = String(body.recipient || "").replace(/\D/g, "").slice(-4);
  const pin = String(body.pin || "");
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  if (!/^\d{4}$/.test(pin)) return NextResponse.json({ error: "Valid 4-digit PIN required" }, { status: 400 });
  if (!accounts.has(recipient)) return NextResponse.json({ error: "Recipient account not found" }, { status: 404 });
  if (recipient === sender) return NextResponse.json({ error: "Use account switching for an own-account transfer" }, { status: 400 });
  const senderBalance = accounts.get(sender)!;
  if (amount > senderBalance) return NextResponse.json({ error: "Insufficient balance" }, { status: 422 });

  // Both balance updates are committed within this server operation.
  accounts.set(sender, Number((senderBalance - amount).toFixed(2)));
  accounts.set(recipient, Number((accounts.get(recipient)! + amount).toFixed(2)));
  const transactionId = `TXN-${Date.now().toString().slice(-9)}`;
  return NextResponse.json({ transactionId, status: "Completed", sender: sender, recipient, amount });
}
