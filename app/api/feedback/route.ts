import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { MAX_CONTACT, MAX_MESSAGE, REPORT_REASONS, type FeedbackInput } from "@/lib/feedback";

// Nhận góp ý / báo lỗi câu hỏi — công khai, không cần đăng nhập.
// Chống spam: ô ẩn bẫy bot, giới hạn độ dài, và giới hạn số lần gửi theo IP.

// Giới hạn theo IP trong bộ nhớ của từng máy chủ: không tuyệt đối (serverless
// có nhiều bản chạy song song) nhưng đủ chặn một người bấm gửi liên tục.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // đừng để Map phình mãi
  return recent.length > MAX_PER_WINDOW;
}

const clip = (s: unknown, max: number) => (typeof s === "string" ? s.trim().slice(0, max) : "");

export async function POST(req: NextRequest) {
  let body: FeedbackInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }

  // Bot điền hết mọi ô, kể cả ô ẩn: giả vờ thành công để nó không thử lại.
  if (body.website) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Bạn gửi hơi nhiều rồi, thử lại sau ít phút nhé." }, { status: 429 });
  }

  const kind = body.kind === "question" ? "question" : body.kind === "general" ? "general" : null;
  if (!kind) return NextResponse.json({ error: "Loại góp ý không hợp lệ." }, { status: 400 });

  const message = clip(body.message, MAX_MESSAGE);
  const contact = clip(body.contact, MAX_CONTACT);
  const reason = REPORT_REASONS.some((r) => r.id === body.reason) ? body.reason : null;

  if (kind === "general" && !message) {
    return NextResponse.json({ error: "Bạn chưa viết nội dung góp ý." }, { status: 400 });
  }
  if (kind === "question" && !reason) {
    return NextResponse.json({ error: "Bạn chọn giúp lý do báo lỗi nhé." }, { status: 400 });
  }

  const lessonId = Number.isInteger(body.lessonId) && body.lessonId! > 0 ? body.lessonId : null;
  const questionIndex = Number.isInteger(body.questionIndex) && body.questionIndex! > 0 ? body.questionIndex : null;

  const { error } = await getSupabaseServer()
    .from("feedback")
    .insert({
      kind,
      reason: kind === "question" ? reason : null,
      message: message || null,
      contact: contact || null,
      lesson_id: kind === "question" ? lessonId : null,
      question_index: kind === "question" ? questionIndex : null,
      question_text: kind === "question" ? clip(body.questionText, 1000) || null : null,
    });

  if (error) {
    console.error("[/api/feedback]", error.message);
    return NextResponse.json({ error: "Chưa gửi được, bạn thử lại sau nhé." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
