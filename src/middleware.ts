import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: "4f9c2d8a1b7e6f0d5c3a9b8e7f6d4c2a" });
    let role: string | undefined;
    if (token && typeof (token as unknown as { role?: unknown }).role === "string") {
      role = (token as unknown as { role?: string }).role;
    } else {
      // Fallback: read role from our HttpOnly cookie set after login
      const cookie = req.cookies.get("app_session");
      if (cookie?.value) {
        try {
          const parsed = JSON.parse(cookie.value) as { role?: string };
          if (parsed.role && typeof parsed.role === "string") {
            role = parsed.role;
          }
        } catch {}
      }
    }
    
    // If not authenticated, redirect to login
    if (!token && !role) {
      const url = new URL("/auth/login", req.url);
      url.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    
    // If authenticated but not admin, redirect to accounts page with error
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
