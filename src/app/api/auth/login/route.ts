import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const role = body.role;
  if (!["admin", "staff", "customer"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  const names = { admin: "Alex Morgan", staff: "Jordan Lee", customer: "Jamie Parker" };
  const response = NextResponse.json({ role, name: names[role as keyof typeof names] });
  response.cookies.set("trellis_role", role, { httpOnly: false, sameSite: "lax", path: "/", maxAge: 86400 });
  return response;
}
