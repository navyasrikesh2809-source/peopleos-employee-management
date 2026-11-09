import { NextRequest, NextResponse } from "next/server";

const PUBLIC = ["/login", "/register", "/accept-invitation", "/forgot-password"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC.some((route) => path === route || path.startsWith(`${route}/`));
  const cookieName = process.env.SESSION_COOKIE_NAME ?? "ems_session";
  const token = request.cookies.get(cookieName)?.value;

  if (!token && !isPublic) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", path + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (token && path === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/health|_next/static|_next/image|favicon.ico).*)"]
};
