import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isLoggedIn = request.cookies.get(ADMIN_SESSION_COOKIE)?.value === "active";

  if (pathname === "/admin") {
    const url = request.nextUrl.clone();
    url.pathname = isLoggedIn ? "/admin/dashboard" : "/login";
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register"]
};
