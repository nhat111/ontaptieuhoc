import { NextRequest, NextResponse } from "next/server";

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
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch (e) {
    return NextResponse.json({ error: "Không thể tải trang." }, { status: 502 });
  }

  // Extract all <p> tag contents
  const pMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  const lines = pMatches
    .map((m) => extractText(m[1]))
    .filter((l) => l.length > 0);

  if (!lines.length) {
    return NextResponse.json({ error: "Không tìm thấy nội dung." }, { status: 422 });
  }

  // Join lines; the examParser will handle header skipping and question detection
  const text = lines.join("\n");
  return NextResponse.json({ text });
}
