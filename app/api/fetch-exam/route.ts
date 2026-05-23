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

// Drop whole lines that look like contact / footer noise (URLs, emails,
// Vietnamese phone numbers, copyright, "Liên hệ" / "Hotline" blocks).
// Conservative — only fires on whole-line patterns so we don't chew
// into the middle of a real exam question that incidentally mentions
// "www" or has long numeric content.
function looksLikeContact(line: string): boolean {
  const s = line.trim();
  if (!s) return false;
  // Email anywhere on the line.
  if (/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/.test(s)) return true;
  // URL anywhere on the line.
  if (/\b(?:https?:\/\/|www\.)[^\s]+/i.test(s)) return true;
  // Lines that BEGIN with contact-context keywords.
  if (/^(?:liên hệ|hotline|đường dây nóng|điện thoại|đt\b|tel\b|email|fax|địa chỉ|fanpage|facebook|copyright|©|bản quyền)/i.test(s)) return true;
  // Lines that are mostly just a Vietnamese phone number (10-11 digits with
  // optional separators, possibly inside parens / dots / spaces). Lets
  // legitimate math content like "42 951" pass since they're shorter and
  // surrounded by Vietnamese words.
  const phoneOnly = s.replace(/[\s().+\-]/g, "");
  if (/^(?:0|84)\d{9,10}$/.test(phoneOnly) && phoneOnly.length <= 12) return true;
  return false;
}

// Convert a <table> body into newline-separated rows of pipe-joined cells.
// loigiaihay puts a lot of question data (Hoàn thành bảng / Điền số …) in
// tables; without this they'd be silently dropped.
function tableToText(tableHtml: string): string {
  const rows = [...tableHtml.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
  return rows
    .map((rowMatch) => {
      const cells = [...rowMatch[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)];
      return cells
        .map((c) => extractText(c[1]))
        .filter((s) => s.length > 0)
        .join(" | ");
    })
    .filter((line) => line.length > 0)
    .join("\n");
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

  // Drop <script>, <style>, <noscript> blocks (and HTML comments) entirely
  // before scanning for <p> — loigiaihay et al. embed ads/GTM/recommendation
  // widgets whose content would otherwise leak into the parsed text.
  html = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // loigiaihay/vietjack wrap each exercise in <div class="box-question …">.
  // When present, scope extraction to those containers so the page's nav,
  // ads, "Lựa chọn câu", and related-lesson chrome don't leak in. Each split
  // segment is one question's markup (until the next container / EOF).
  const boxSegments = html.split(/<div\b[^>]*class="[^"]*box-question[^"]*"[^>]*>/i).slice(1);
  const scopes = boxSegments.length > 0 ? boxSegments : [html];

  // Scan <p> and <table> blocks in document order so question text and the
  // tables that go with them stay paired up.
  const BLOCK_RE = /<(p|table)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const lines: string[] = [];
  for (const scope of scopes) {
    for (const m of scope.matchAll(BLOCK_RE)) {
      const tag = m[1].toLowerCase();
      const inner = m[2];
      const text = tag === "table" ? tableToText(inner) : extractText(inner);
      if (text.length === 0) continue;
      // Filter contact/footer noise per sub-line so a table row stays even
      // if a different row in the same block is junk.
      const filtered = text
        .split("\n")
        .filter((sub) => !looksLikeContact(sub))
        .join("\n")
        .trim();
      if (filtered.length > 0) lines.push(filtered);
    }
  }

  if (!lines.length) {
    return NextResponse.json({ error: "Không tìm thấy nội dung." }, { status: 422 });
  }

  const text = lines.join("\n");
  return NextResponse.json({ text });
}
