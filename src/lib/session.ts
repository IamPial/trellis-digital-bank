import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function requireSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("trellis_session")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "trellis-development-secret-change-me");
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}
