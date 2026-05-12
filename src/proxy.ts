import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthed = !!req.auth?.user;
  const isAdmin = req.auth?.user?.role === "admin";

  const isAccountRoute = pathname.startsWith("/account");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/reset-password");

  if ((isAccountRoute || isAdminRoute) && !isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && !isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/account";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password/:path*",
  ],
};
