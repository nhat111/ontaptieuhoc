import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { parseUsageEvent } from "@/lib/usage";

// Nhận một lượt dùng (lib/usage.ts → track). Công khai, không định danh: không
// lưu IP hay tài khoản. Luôn trả 204 kể cả khi lỗi — phía trình duyệt không đọc
// kết quả, và báo lỗi cho ai đó đang bấm "In" chẳng ích gì.

// Giới hạn theo IP trong bộ nhớ (mỗi máy chủ một bản, như /api/feedback): chặn
// một script bơm số liệu, không phải chống tuyệt đối. Người thật khó vượt 60
// lượt / 10 phút.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 60;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const done = () => new NextResponse(null, { status: 204 });

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return done();
  }
  const event = parseUsageEvent(body);
  if (!event) return done();

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return done();

  try {
    const { error } = await getSupabaseServer().from("usage_events").insert(event);
    if (error) console.error("[/api/usage]", error.message);
  } catch (e) {
    console.error("[/api/usage]", e instanceof Error ? e.message : e);
  }
  return done();
}
