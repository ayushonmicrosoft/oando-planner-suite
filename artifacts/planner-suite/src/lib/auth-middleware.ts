import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = [
  "/planner",
  "/planners",
  "/viewer",
  "/tools",
  "/templates",
  "/catalog",
  "/plans",
  "/settings",
  "/clients",
  "/projects",
  "/admin",
];

export function authMiddleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const isAuthenticated = !!sessionCookie?.value;

  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-up";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && request.nextUrl.pathname === "/sign-up") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
