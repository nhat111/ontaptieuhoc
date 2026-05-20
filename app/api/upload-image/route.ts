import { getSupabaseServer } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Không tìm thấy ảnh trong yêu cầu." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File rỗng." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Ảnh quá lớn (tối đa 10MB)." }, { status: 413 });
  }
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: `Định dạng không hỗ trợ: ${file.type}` }, { status: 415 });
  }

  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `questions/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "bin"}`;

  const sb = getSupabaseServer();
  const { error } = await sb.storage.from("question-images").upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) {
    console.error("[/api/upload-image]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = sb.storage.from("question-images").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
