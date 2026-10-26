// lib/sheetArt.ts
// Hình trang trí cho phiếu bài tập in (phiếu theo chủ đề, phiếu luyện hằng ngày): mặt trời,
// ngôi sao, quả táo, bông hoa, đám mây, bút chì, cú mèo — đều có mặt cười, tự vẽ bằng SVG.
//
// Ảnh là SVG data URI có width/height (lib/wordDoc.ts cần cỡ gốc để vẽ lại thành PNG cho Word).
// Màu pastel, nét đậm: in trắng đen vẫn ra hình rõ. Không đổi gì trong phần sinh câu hỏi —
// trang trí chỉ nằm ở HTML in, nên phiếu cùng seed vẫn ra đúng các câu cũ.

const uri = (body: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">${body}</svg>`);

/** Mắt, má hồng và miệng cười, tâm (x, y), độ rộng mặt s. */
const face = (x: number, y: number, s = 1) =>
  `<circle cx="${x - 7 * s}" cy="${y}" r="${2.6 * s}" fill="#1f2937"/>` +
  `<circle cx="${x + 7 * s}" cy="${y}" r="${2.6 * s}" fill="#1f2937"/>` +
  `<circle cx="${x - 6.4 * s}" cy="${y - 0.9 * s}" r="${0.8 * s}" fill="#fff"/>` +
  `<circle cx="${x + 7.6 * s}" cy="${y - 0.9 * s}" r="${0.8 * s}" fill="#fff"/>` +
  `<ellipse cx="${x - 12 * s}" cy="${y + 5 * s}" rx="${3.4 * s}" ry="${2.2 * s}" fill="#fb7185" opacity=".6"/>` +
  `<ellipse cx="${x + 12 * s}" cy="${y + 5 * s}" rx="${3.4 * s}" ry="${2.2 * s}" fill="#fb7185" opacity=".6"/>` +
  `<path d="M${x - 4.5 * s} ${y + 4.5 * s} Q${x} ${y + 9.5 * s} ${x + 4.5 * s} ${y + 4.5 * s}" fill="none" stroke="#1f2937" stroke-width="${2 * s}" stroke-linecap="round"/>`;

const rays = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  const p = (r: number) => `${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`;
  return `<path d="M${p(37)} L${p(47)}" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>`;
}).join("");

const starPath = (cx: number, cy: number, R: number, r: number) =>
  "M" +
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const d = i % 2 ? r : R;
    return `${(cx + d * Math.cos(a)).toFixed(1)} ${(cy + d * Math.sin(a)).toFixed(1)}`;
  }).join(" L") +
  "Z";

const petals = Array.from({ length: 6 }, (_, i) => {
  const a = (i * Math.PI) / 3;
  return `<circle cx="${(50 + 24 * Math.cos(a)).toFixed(1)}" cy="${(50 + 24 * Math.sin(a)).toFixed(1)}" r="16" fill="#f9a8d4" stroke="#ec4899" stroke-width="2.5"/>`;
}).join("");

export const ART = {
  sun: uri(rays + `<circle cx="50" cy="50" r="29" fill="#fde047" stroke="#f59e0b" stroke-width="3"/>` + face(50, 48, 1.15)),
  star: uri(
    `<path d="${starPath(50, 54, 44, 21)}" fill="#fcd34d" stroke="#f59e0b" stroke-width="3.5" stroke-linejoin="round"/>` + face(50, 54, 0.95),
  ),
  apple: uri(
    `<path d="M50 30 C38 20 14 24 15 50 C16 76 34 92 50 84 C66 92 84 76 85 50 C86 24 62 20 50 30Z" fill="#f87171" stroke="#dc2626" stroke-width="3"/>` +
      `<path d="M50 30 Q49 18 55 10" fill="none" stroke="#92400e" stroke-width="4" stroke-linecap="round"/>` +
      `<path d="M55 18 Q70 6 80 16 Q68 26 55 18Z" fill="#4ade80" stroke="#16a34a" stroke-width="2.5"/>` +
      face(50, 56, 1.1),
  ),
  flower: uri(petals + `<circle cx="50" cy="50" r="19" fill="#fde047" stroke="#f59e0b" stroke-width="2.5"/>` + face(50, 48, 0.8)),
  cloud: uri(
    `<path d="M24 74 C8 74 6 52 22 50 C20 32 42 26 50 38 C56 22 82 26 80 46 C96 48 94 74 78 74Z" fill="#e0f2fe" stroke="#38bdf8" stroke-width="3" stroke-linejoin="round"/>` +
      face(50, 58, 1),
  ),
  pencil: uri(
    `<g transform="rotate(-35 50 50)">` +
      `<rect x="14" y="36" width="56" height="28" rx="3" fill="#fde047" stroke="#ca8a04" stroke-width="3"/>` +
      `<rect x="4" y="36" width="12" height="28" rx="4" fill="#f9a8d4" stroke="#db2777" stroke-width="3"/>` +
      `<path d="M70 36 L94 50 L70 64Z" fill="#fed7aa" stroke="#ca8a04" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M86 45.3 L94 50 L86 54.7Z" fill="#374151"/>` +
      `</g>` +
      face(46, 50, 0.85),
  ),
  owl: uri(
    `<path d="M22 30 L30 10 L40 24 L60 24 L70 10 L78 30 C88 50 84 90 50 92 C16 90 12 50 22 30Z" fill="#c4b5fd" stroke="#7c3aed" stroke-width="3" stroke-linejoin="round"/>` +
      `<ellipse cx="50" cy="70" rx="20" ry="17" fill="#ede9fe"/>` +
      `<circle cx="37" cy="42" r="12" fill="#fff" stroke="#7c3aed" stroke-width="2.5"/>` +
      `<circle cx="63" cy="42" r="12" fill="#fff" stroke="#7c3aed" stroke-width="2.5"/>` +
      `<circle cx="38" cy="43" r="5.5" fill="#1f2937"/><circle cx="62" cy="43" r="5.5" fill="#1f2937"/>` +
      `<circle cx="39.5" cy="41" r="1.6" fill="#fff"/><circle cx="63.5" cy="41" r="1.6" fill="#fff"/>` +
      `<path d="M45 52 L55 52 L50 60Z" fill="#fb923c" stroke="#ea580c" stroke-width="2" stroke-linejoin="round"/>` +
      `<ellipse cx="26" cy="54" rx="4" ry="2.6" fill="#fb7185" opacity=".6"/><ellipse cx="74" cy="54" rx="4" ry="2.6" fill="#fb7185" opacity=".6"/>` +
      `<path d="M30 72 L50 78 L70 72 L70 88 L50 94 L30 88Z" fill="#7dd3fc" stroke="#0284c7" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<path d="M50 78 L50 94" stroke="#0284c7" stroke-width="2.5"/>`,
  ),
} as const;

export type ArtName = keyof typeof ART;

/** Hình nhỏ cạnh tiêu đề "Bài n" — luân phiên để mỗi bài một hình. */
const BULLETS: ArtName[] = ["star", "apple", "flower", "sun", "cloud", "pencil"];
export const bulletArt = (i: number): ArtName => BULLETS[i % BULLETS.length];

/** Thẻ <img> có sẵn width/height (Word bỏ qua CSS khi định cỡ ảnh). */
export const artImg = (name: ArtName, size: number, cls = "art") =>
  `<img class="${cls}" src="${ART[name]}" alt="" width="${size}" height="${size}"/>`;

/**
 * Tiêu đề phiếu kẹp giữa hai hình: một bảng 3 cột (Word không hiểu flex).
 * `titleHtml` là phần đã escape, gồm <h1> và các dòng phụ.
 */
export function decoratedHeader(titleHtml: string, left: ArtName = "owl", right: ArtName = "sun", size = 64): string {
  return (
    `<table class="hd"><tr>` +
    `<td class="hd-art">${artImg(left, size)}</td>` +
    `<td class="hd-mid">${titleHtml}</td>` +
    `<td class="hd-art">${artImg(right, size)}</td>` +
    `</tr></table>`
  );
}

/** CSS dùng chung cho phần trang trí. */
export const ART_CSS = `
  .hd { width: 100%; border-collapse: collapse; margin: 0 0 4px; }
  .hd td { vertical-align: middle; padding: 0; }
  .hd-art { width: 76px; text-align: center; }
  .hd-mid h1 { margin-bottom: 2px; }
  img.art { vertical-align: middle; }
  img.bul { vertical-align: -6px; margin-right: 4px; }
`;
