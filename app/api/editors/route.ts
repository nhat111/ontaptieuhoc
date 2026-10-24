import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isMissingSchema, requireAdmin } from "@/lib/editorAuth";
import { normalizeEmail, parseEmailList } from "@/lib/editorRules";

// Danh sách người được mời soạn đề (bảng `editors`). Chỉ quản trị.
// Trang dùng: /import/nguoi-soan.

const SETUP_HINT = "Chưa có bảng người soạn — chạy file supabase/nguoi-soan.sql trong Supabase SQL Editor trước.";

/** `{ emails: "a@x.vn, b@y.vn", note? }` — thêm nhiều email một lần, email đã có thì cập nhật ghi chú. */
export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.response) return gate.response;

  let body: { emails?: unknown; note?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }
  const { emails, invalid } = parseEmailList(typeof body.emails === "string" ? body.emails : "");
  if (invalid.length) return NextResponse.json({ error: `Không phải email: ${invalid.join(", ")}` }, { status: 400 });
  if (!emails.length) return NextResponse.json({ error: "Chưa nhập email nào." }, { status: 400 });
  if (emails.length > 50) return NextResponse.json({ error: "Mỗi lần thêm tối đa 50 email." }, { status: 400 });

  const note = typeof body.note === "string" && body.note.trim() ? body.note.trim().slice(0, 120) : null;
  const { error } = await getSupabaseServer()
    .from("editors")
    .upsert(emails.map((email) => ({ email, ...(note ? { note } : {}) })), { onConflict: "email" });
  if (error) {
    return NextResponse.json({ error: isMissingSchema(error) ? SETUP_HINT : error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, added: emails });
}

/**
 * `?email=` — thôi mời. Bài người đó đã soạn vẫn còn nguyên (vẫn mang tên họ),
 * chỉ là họ không vào khu soạn đề được nữa; quản trị vẫn sửa được mọi bài.
 */
export async function DELETE(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.response) return gate.response;

  const email = normalizeEmail(req.nextUrl.searchParams.get("email") ?? "");
  if (!email) return NextResponse.json({ error: "Thiếu email." }, { status: 400 });
  const { error } = await getSupabaseServer().from("editors").delete().eq("email", email);
  if (error) {
    return NextResponse.json({ error: isMissingSchema(error) ? SETUP_HINT : error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
