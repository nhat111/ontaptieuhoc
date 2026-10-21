// File Word (.doc) có hình: đóng gói HTML + ảnh thành MHTML (multipart/related) —
// đúng dạng "Trang web, một tệp" mà chính Word lưu ra, nên Word mở được và hiện ảnh.
//
// Vì sao không để <img src> như cũ: Word không đọc ảnh `data:` (hình SVG tự vẽ
// của đề) và chỉ tải ảnh qua link khi máy có mạng và Word cho phép — thường là
// không, nên đề tải về mất hết hình. Ở đây mọi ảnh được vẽ lại thành PNG/JPEG
// (SVG, WebP Word cũng không đọc) rồi nhúng thành một phần của file.

const BASE = "file:///C:/ontap/";

export interface MhtImage {
  name: string;
  mime: string;
  base64: string;
}

/** Quoted-printable cho phần HTML (UTF-8) — giữ dòng ≤ 76 ký tự như chuẩn MIME. */
export function quotedPrintable(text: string): string {
  const bytes = new TextEncoder().encode(text.replace(/\r?\n/g, "\r\n"));
  let out = "";
  let line = "";
  const push = (tok: string) => {
    if (line.length + tok.length > 75) {
      out += line + "=\r\n";
      line = "";
    }
    line += tok;
  };
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b === 13 && bytes[i + 1] === 10) {
      // Khoảng trắng cuối dòng phải mã hoá, không thì bị cắt mất.
      if (line.endsWith(" ") || line.endsWith("\t")) {
        const last = line.charCodeAt(line.length - 1);
        line = line.slice(0, -1) + "=" + last.toString(16).toUpperCase().padStart(2, "0");
      }
      out += line + "\r\n";
      line = "";
      i++;
    } else if ((b >= 33 && b <= 126 && b !== 61) || b === 32 || b === 9) {
      push(String.fromCharCode(b));
    } else {
      push("=" + b.toString(16).toUpperCase().padStart(2, "0"));
    }
  }
  return out + line;
}

const wrap76 = (s: string) => s.replace(/.{1,76}/g, "$&\r\n");

/** Ghép HTML + ảnh thành nội dung MHTML. `src` của ảnh trong HTML phải là `imageSrc(name)`. */
export function buildMhtml(html: string, images: MhtImage[]): string {
  const boundary = "----=_NextPart_OnTap_" + Math.random().toString(36).slice(2);
  const parts = [
    `--${boundary}\r\nContent-Location: ${BASE}de.htm\r\nContent-Transfer-Encoding: quoted-printable\r\nContent-Type: text/html; charset="utf-8"\r\n\r\n${quotedPrintable(html)}\r\n`,
    ...images.map((im) =>
      `--${boundary}\r\nContent-Location: ${imageSrc(im.name)}\r\nContent-Transfer-Encoding: base64\r\nContent-Type: ${im.mime}\r\n\r\n${wrap76(im.base64)}`,
    ),
  ];
  return `MIME-Version: 1.0\r\nContent-Type: multipart/related; boundary="${boundary}"; type="text/html"\r\n\r\n${parts.join("")}--${boundary}--\r\n`;
}

export const imageSrc = (name: string) => `${BASE}de_files/${name}`;

// Cỡ hiển thị tối đa trong Word (px ở 96 dpi) — Word bỏ qua max-width của CSS.
const MAX_W = 600;
const MAX_H = 320;

const unescapeAttr = (s: string) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

interface Raster { mime: string; base64: string; w: number; h: number }

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    if (/^https?:/i.test(src)) im.crossOrigin = "anonymous";
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error("img"));
    im.src = src;
  });
}

async function rasterize(src: string): Promise<Raster | null> {
  try {
    const im = await loadImage(src);
    const w = im.naturalWidth || 300;
    const h = im.naturalHeight || 150;
    const isSvg = /^data:image\/svg|\.svg(\?|$)/i.test(src);
    const jpeg = /^data:image\/jpe?g|\.jpe?g(\?|$)/i.test(src);
    const k = isSvg ? 2 : 1; // hình vẽ SVG: vẽ gấp đôi cho nét in sắc
    const c = document.createElement("canvas");
    c.width = Math.round(w * k);
    c.height = Math.round(h * k);
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(im, 0, 0, c.width, c.height);
    const mime = jpeg ? "image/jpeg" : "image/png";
    const url = c.toDataURL(mime, 0.9);
    return { mime, base64: url.slice(url.indexOf(",") + 1), w, h };
  } catch {
    return null; // ảnh lỗi/chặn CORS: giữ link gốc, Word có mạng vẫn có thể tải
  }
}

/** HTML tài liệu in → Blob .doc (MHTML) có nhúng sẵn mọi ảnh. */
export async function buildWordDoc(html: string): Promise<Blob> {
  const srcs = [...new Set([...html.matchAll(/<img\b[^>]*?\ssrc="([^"]*)"/gi)].map((m) => m[1]))];
  const rasters = new Map<string, Raster | null>();
  await Promise.all(srcs.map(async (s) => rasters.set(s, await rasterize(unescapeAttr(s)))));

  const images: MhtImage[] = [];
  const names = new Map<string, string>();
  for (const s of srcs) {
    const r = rasters.get(s);
    if (!r) continue;
    const name = `image${String(images.length + 1).padStart(3, "0")}.${r.mime === "image/jpeg" ? "jpg" : "png"}`;
    names.set(s, name);
    images.push({ name, mime: r.mime, base64: r.base64 });
  }

  const out = html.replace(/<img\b([^>]*?)\/?>/gi, (tag, attrs: string) => {
    const m = attrs.match(/\ssrc="([^"]*)"/i);
    const name = m && names.get(m[1]);
    if (!m || !name) return tag;
    const r = rasters.get(m[1])!;
    let rest = attrs.replace(m[0], "");
    // Giữ cỡ đã ghi sẵn (phiếu bài tập ghi width/height); không có thì tự co cho vừa trang.
    if (!/\swidth=/i.test(rest)) {
      const s = Math.min(1, MAX_W / r.w, MAX_H / r.h);
      rest += ` width="${Math.round(r.w * s)}" height="${Math.round(r.h * s)}"`;
    }
    return `<img src="${imageSrc(name)}"${rest}/>`;
  });

  return new Blob([buildMhtml(out, images)], { type: "application/msword" });
}
