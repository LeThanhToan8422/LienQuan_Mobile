import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: "4f9c2d8a1b7e6f0d5c3a9b8e7f6d4c2a" });
    
    // If not authenticated, redirect to login
    if (!token) {
      const url = new URL("/auth/login", req.url);
      url.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    
    // If authenticated but not admin, redirect to accounts page with error
    const role =
      typeof (token as unknown as { role?: unknown }).role === "string"
        ? (token as unknown as { role?: string }).role
        : undefined;
        
    if (role !== "ADMIN") {
      const url = new URL("/accounts", req.url);
      url.searchParams.set("error", "access-denied");
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
