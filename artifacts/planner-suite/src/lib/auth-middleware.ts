import { NextResponse, type NextRequest } from "next/server";

export function authMiddleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/sign-up") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
