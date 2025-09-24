import { NextResponse } from "next/server";

const COOKIE_NAME = "app_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(req: Request) {
  try {
    const { userId, role } = (await req.json()) as {
      userId?: string;
      role?: string;
    };

    if (!userId || !role) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true });
    // Minimal payload; not a signed JWT, but sufficient for middleware role gate
    const value = JSON.stringify({ userId, role });
    res.cookies.set(COOKIE_NAME, value, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}


