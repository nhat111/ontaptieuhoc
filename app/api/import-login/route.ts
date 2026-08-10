import { NextRequest, NextResponse } from "next/server";
import { IMPORT_COOKIE, checkPassword, expectedToken, isImportProtected } from "@/lib/importAuth";

// Nhận mật khẩu chung, đặt cookie cho phép vào khu soạn nội dung.

export async function POST(req: NextRequest) {
  if (!isImportProtected()) {
    return NextResponse.json({ ok: true, open: true });
  }

  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }

  if (!(await checkPassword(body.password))) {
    return NextResponse.json({ error: "Mật khẩu không đúng." }, { status: 401 });
  }

  const token = await expectedToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(IMPORT_COOKIE, token!, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 ngày, để không phải gõ lại mỗi lần vào
  });
  return res;
}

/** Đăng xuất khỏi khu soạn nội dung. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(IMPORT_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
