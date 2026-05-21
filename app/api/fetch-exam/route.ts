import { NextRequest, NextResponse } from "next/server";
import { lookup } from "node:dns/promises";

const FETCH_TIMEOUT_MS = 8000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;

// RFC1918 + loopback + link-local + IPv6 ULA/loopback/link-local.
function isPrivateAddress(ip: string): boolean {
  return (
    /^10\./.test(ip) ||
    /^127\./.test(ip) ||
    /^169\.254\./.test(ip) ||
    /^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^0\./.test(ip) ||
    ip === "::1" ||
    /^fc/i.test(ip) ||
    /^fd/i.test(ip) ||
    /^fe80:/i.test(ip)
  );
}

// Strip HTML tags while preserving LaTeX math delimiters and converting <sup>
function extractText(html: string): string {
  html = html.replace(/<sup[^>]*>(.*?)<\/sup>/gi, "^($1)");
  html = html.replace(/<[^>]+>/g, "");
  html = html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#160;/g, " ")
    .replace(/&#\d+;/g, "");
  return html.trim();
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url");
  if (!rawUrl) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "URL không hợp lệ." }, { status: 400 });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Chỉ hỗ trợ http/https." }, { status: 400 });
  }

  // Resolve all A/AAAA records and reject if any points to a private range.
  // Doesn't fully defeat DNS rebinding (the host could re-resolve to a private
  // IP between this lookup and the fetch), but blocks the easy cases.
  try {
    const addrs = await lookup(parsed.hostname, { all: true });
    if (!addrs.length || addrs.some((a) => isPrivateAddress(a.address))) {
      return NextResponse.json({ error: "Domain không hợp lệ." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Không phân giải được tên miền." }, { status: 400 });
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);

  let html: string;
  try {
    const res = await fetch(parsed.toString(), {
      signal: ctrl.signal,
      redirect: "error",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // Cap response size to prevent memory exhaustion.
    const reader = res.body?.getReader();
    if (!reader) throw new Error("No body");
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_RESPONSE_BYTES) {
        reader.cancel();
        throw new Error("Response too large");
      }
      chunks.push(value);
    }
    html = new TextDecoder("utf-8").decode(Buffer.concat(chunks.map((c) => Buffer.from(c))));
  } catch {
    clearTimeout(timer);
    return NextResponse.json({ error: "Không thể tải trang." }, { status: 502 });
  }
  clearTimeout(timer);

  const pMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  const lines = pMatches
    .map((m) => extractText(m[1]))
    .filter((l) => l.length > 0);

  if (!lines.length) {
    return NextResponse.json({ error: "Không tìm thấy nội dung." }, { status: 422 });
  }

  const text = lines.join("\n");
  return NextResponse.json({ text });
}
