import { NextRequest, NextResponse } from "next/server";
import { IMPORT_COOKIE, checkPassword, expectedToken, isImportProtected } from "@/lib/importAuth";

// Nhận mật khẩu chung, đặt cookie cho phép vào khu soạn nội dung.

// Chặn đoán mật khẩu: mỗi IP chỉ được sai MAX_FAILS lần trong WINDOW_MS. Đếm
// trong bộ nhớ từng máy chủ (serverless có nhiều bản chạy song song) nên không
// tuyệt đối, nhưng cộng với độ trễ mỗi lần sai thì dò mật khẩu thành rất chậm.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 10;
const FAIL_DELAY_MS = 800;
const fails = new Map<string, number[]>();

function recentFails(ip: string): number[] {
  const now = Date.now();
  const recent = (fails.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length) fails.set(ip, recent);
  else fails.delete(ip);
  return recent;
}

function recordFail(ip: string) {
  if (fails.size > 5000) fails.clear(); // đừng để Map phình mãi
  fails.set(ip, [...recentFails(ip), Date.now()]);
}

/**
 * Khoá có đang bật không. Chỉ trả boolean, không lộ mật khẩu.
 *
 * Mở được bằng trình duyệt nên người vận hành tự kiểm được biến môi trường đã
 * tới đúng bản deploy chưa — thay vì đoán qua việc trang có chuyển hướng hay
 * không, vốn còn phụ thuộc cookie sẵn có trong máy.
 */
export async function GET() {
  return NextResponse.json({ locked: isImportProtected() });
}

export async function POST(req: NextRequest) {
  if (!isImportProtected()) {
    return NextResponse.json({ ok: true, open: true });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (recentFails(ip).length >= MAX_FAILS) {
    return NextResponse.json(
      { error: "Nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút." },
      { status: 429 },
    );
  }

  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }

  if (!(await checkPassword(body.password))) {
    recordFail(ip);
    await new Promise((r) => setTimeout(r, FAIL_DELAY_MS));
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
