import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isImportProtected } from "@/lib/importAuth";
import { requireAdmin } from "@/lib/editorAuth";

// Đánh dấu góp ý đã xử lý / chưa xử lý — chỉ người có mật khẩu soạn đề.
// Chưa đặt IMPORT_PASSWORD thì từ chối luôn (giống hộp thư /import/gop-y),
// không mở toang như các route soạn đề khác.
export async function POST(req: NextRequest) {
  if (!isImportProtected()) {
    return NextResponse.json({ error: "Chưa đặt mật khẩu soạn đề nên hộp thư góp ý đang khoá." }, { status: 403 });
  }
  // Góp ý có SĐT / email phụ huynh — chỉ quản trị, người soạn không xem được.
  const gate = await requireAdmin();
  if (gate.response) return gate.response;

  let body: { id?: unknown; resolved?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Thiếu mã góp ý." }, { status: 400 });
  }

  const { error } = await getSupabaseServer()
    .from("feedback")
    .update({ resolved: body.resolved !== false })
    .eq("id", id);
  if (error) {
    console.error("[/api/feedback/resolve]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
