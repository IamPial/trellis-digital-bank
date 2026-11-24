import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const sectionRoles: Record<string, string[]> = {
  accounts: ["admin", "customer"],
  customers: ["admin", "staff"],
  transactions: ["admin", "staff", "customer"],
  transfers: ["customer"],
  loans: ["customer"],
  statements: ["customer"],
  "loan-review": ["staff"],
  "pending-requests": ["staff"],
  "loan-management": ["admin"],
  settings: ["admin"],
};

export async function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/dashboard")) return NextResponse.next();

  const token = request.cookies.get("trellis_session")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "trellis-development-secret-change-me");
    const { payload } = await jwtVerify(token, secret);
    const section = request.nextUrl.pathname.split("/")[2];
    const allowedRoles = section ? sectionRoles[section] : undefined;
    if (section && (!allowedRoles || !allowedRoles.includes(String(payload.role)))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
