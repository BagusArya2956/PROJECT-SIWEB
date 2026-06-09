import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_IDENTITY_COOKIE,
  ADMIN_SESSION_ROLE_COOKIE
} from "@/lib/auth";

function getRequestedPath(request: NextRequest) {
  return `${request.nextUrl.pathname}${request.nextUrl.search}`;
}

function getSafeAdminNext(value: string | null) {
  if (!value || !value.startsWith("/admin/")) return "/admin/dashboard";
  if (value.startsWith("/admin/login")) return "/admin/dashboard";
  return value;
}

function applyAdminDestination(url: URL, value: string | null) {
  const destination = getSafeAdminNext(value);
  const [nextPathname, nextSearch = ""] = destination.split("?");
  url.pathname = nextPathname;
  url.search = nextSearch ? `?${nextSearch}` : "";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminLoginRoute = pathname === "/admin/login";
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isProtectedAdminRoute = isAdminRoute && !isAdminLoginRoute;
  const isPublicAuthRoute = pathname === "/login" || pathname === "/register";
  const isPasswordRecoveryRoute = pathname === "/lupa-password";
  const isAuthRoute = isAdminLoginRoute || isPublicAuthRoute || isPasswordRecoveryRoute;
  const isLoggedIn = request.cookies.get(ADMIN_SESSION_COOKIE)?.value === "active";
  const identity = request.cookies.get(ADMIN_SESSION_IDENTITY_COOKIE)?.value;
  const role = request.cookies.get(ADMIN_SESSION_ROLE_COOKIE)?.value;

  if (pathname === "/admin") {
    const url = request.nextUrl.clone();
    url.pathname = isLoggedIn ? "/admin/dashboard" : "/admin/login";
    url.search = "";
    if (!isLoggedIn && identity) {
      url.searchParams.set("reason", "expired");
      url.searchParams.set("next", "/admin/dashboard");
    } else if (!isLoggedIn) {
      url.searchParams.set("reason", "protected");
      url.searchParams.set("next", "/admin/dashboard");
    }
    return NextResponse.redirect(url);
  }

  if (isProtectedAdminRoute && !isLoggedIn) {
    const url = request.nextUrl.clone();
    const requestedPath = getRequestedPath(request);
    url.pathname = "/admin/login";
    url.search = "";
    if (identity) {
      url.searchParams.set("reason", "expired");
    } else {
      url.searchParams.set("reason", "protected");
    }
    url.searchParams.set("next", requestedPath);
    return NextResponse.redirect(url);
  }

  if (isProtectedAdminRoute && role && role !== "ADMIN") {
    const url = request.nextUrl.clone();
    url.pathname = "/403";
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && isLoggedIn) {
    const url = request.nextUrl.clone();
    applyAdminDestination(url, request.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register", "/lupa-password"]
};
