import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    if (user.status !== "active") return NextResponse.json({ error: "Account is unavailable" }, { status: 403 });

    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "trellis-development-secret-change-me");
    const token = await new SignJWT({ sub: user.id, role: user.role, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(secret);

    const response = NextResponse.json({ id: user.id, role: user.role, name: user.fullName, email: user.email });
    response.cookies.set("trellis_session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 28800 });
    response.cookies.set("trellis_role", user.role, { sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 28800 });
    return response;
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
