import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED = ["/dashboard", "/questions", "/schedule", "/tracks", "/settings", "/profile", "/admin", "/random"];
const AUTH_PAGES = ["/login", "/signup"];

// Optimistic check only: pages and actions still verify the user through the data access layer.
async function hasValidSession(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthPage = AUTH_PAGES.includes(pathname);
  if (!isProtected && !isAuthPage) return NextResponse.next();

  const authed = await hasValidSession(req);
  if (isProtected && !authed) return NextResponse.redirect(new URL("/login", req.url));
  if (isAuthPage && authed) return NextResponse.redirect(new URL("/dashboard", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
