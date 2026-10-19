// lib/exam5/figures.ts
// Hình vẽ cho đề Toán lớp 5, vẽ giống hình trong đề in: nét đen trên nền trắng, đỉnh
// ghi chữ in hoa, đường cao nét đứt có kí hiệu góc vuông, số đo ghi cạnh đoạn thẳng.
// Trả về data URI SVG — cùng cách mặt đồng hồ (lib/mathGen/shared.ts) đang dùng, nên
// trang quiz, trang kết quả, bản in và Word đều hiện được mà không cần Storage.
//
// Hình chỉ minh hoạ, không vẽ đúng tỉ lệ số đo (đề thật cũng vậy): kích thước vẽ được
// kẹp trong khoảng dễ nhìn để hình không quá dẹt hay quá cao.

const STROKE = "#111";
const FONT = `font-family="Times New Roman, serif" fill="${STROKE}"`;

type Pt = { x: number; y: number };

const fx = (n: number) => Number(n.toFixed(1));

function svg(w: number, h: number, body: string): string {
  const s =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
    `<rect width="${w}" height="${h}" fill="#fff"/>${body}</svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(s);
}

const line = (a: Pt, b: Pt, dashed = false, width = 1.6) =>
  `<line x1="${fx(a.x)}" y1="${fx(a.y)}" x2="${fx(b.x)}" y2="${fx(b.y)}" stroke="${STROKE}" stroke-width="${width}"` +
  (dashed ? ` stroke-dasharray="5 4"` : "") + `/>`;

const poly = (pts: Pt[]) =>
  `<polygon points="${pts.map((p) => `${fx(p.x)},${fx(p.y)}`).join(" ")}" fill="none" stroke="${STROKE}" stroke-width="1.8" stroke-linejoin="round"/>`;

const text = (p: Pt, s: string, size = 15, anchor: "start" | "middle" | "end" = "middle", italic = false) =>
  `<text x="${fx(p.x)}" y="${fx(p.y)}" font-size="${size}" text-anchor="${anchor}" dominant-baseline="central"${italic ? ` font-style="italic"` : ""} ${FONT}>${esc(s)}</text>`;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Kí hiệu góc vuông tại `at`, hai cạnh theo hướng u và v (vectơ đơn vị). */
function rightAngle(at: Pt, u: Pt, v: Pt, s = 9): string {
  const p1 = { x: at.x + u.x * s, y: at.y + u.y * s };
  const p2 = { x: p1.x + v.x * s, y: p1.y + v.y * s };
  const p3 = { x: at.x + v.x * s, y: at.y + v.y * s };
  return `<polyline points="${fx(p1.x)},${fx(p1.y)} ${fx(p2.x)},${fx(p2.y)} ${fx(p3.x)},${fx(p3.y)}" fill="none" stroke="${STROKE}" stroke-width="1.2"/>`;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Tỉ lệ vẽ: giữ quan hệ lớn/bé giữa các số đo nhưng kẹp vào khung nhìn được. */
function scale(values: number[], lo: number, hi: number): number[] {
  const max = Math.max(...values);
  return values.map((v) => clamp((v / max) * hi, lo, hi));
}

/* ───────────── Hình tam giác ABC, đường cao AH ───────────── */

export function triangleSvg(o: { base: string; height: string; baseVal: number; heightVal: number; footT?: number }): string {
  const [bw, hh] = scale([o.baseVal, o.heightVal], 70, 200);
  const W = bw + 80, H = hh + 70;
  const B = { x: 40, y: hh + 30 }, C = { x: 40 + bw, y: hh + 30 };
  const t = o.footT ?? 0.35;
  const Hf = { x: B.x + bw * t, y: B.y };
  const A = { x: Hf.x, y: B.y - hh };
  return svg(W, H,
    poly([A, B, C]) +
    line(A, Hf, true, 1.3) +
    rightAngle(Hf, { x: 1, y: 0 }, { x: 0, y: -1 }) +
    text({ x: A.x, y: A.y - 12 }, "A") + text({ x: B.x - 12, y: B.y + 6 }, "B") +
    text({ x: C.x + 12, y: C.y + 6 }, "C") + text({ x: Hf.x, y: Hf.y + 14 }, "H") +
    text({ x: B.x + bw * 0.72, y: B.y + 18 }, o.base, 14, "middle", true) +
    text({ x: A.x + 8, y: (A.y + Hf.y) / 2 }, o.height, 14, "start", true),
  );
}

/** Tam giác vuông tại A: hai cạnh góc vuông AB (đứng), AC (nằm). */
export function rightTriangleSvg(o: { ab: string; ac: string; abVal: number; acVal: number }): string {
  const [w, h] = scale([o.acVal, o.abVal], 70, 190);
  const A = { x: 64, y: h + 30 }, B = { x: 64, y: 30 }, C = { x: 64 + w, y: h + 30 };
  return svg(w + 104, h + 70,
    poly([A, B, C]) + rightAngle(A, { x: 1, y: 0 }, { x: 0, y: -1 }) +
    text({ x: B.x, y: B.y - 12 }, "B") + text({ x: A.x - 12, y: A.y + 6 }, "A") + text({ x: C.x + 12, y: C.y + 6 }, "C") +
    text({ x: A.x - 10, y: (A.y + B.y) / 2 }, o.ab, 14, "end", true) +
    text({ x: (A.x + C.x) / 2, y: A.y + 16 }, o.ac, 14, "middle", true),
  );
}

/* ───────────── Hình thang ABCD (AB đáy bé ở trên, DC đáy lớn) ───────────── */

export function trapezoidSvg(o: { top: string; bottom: string; height: string; topVal: number; bottomVal: number; heightVal: number; right?: boolean }): string {
  const [tw, bw, hh] = scale([o.topVal, o.bottomVal, o.heightVal], 50, 220);
  const bottomW = Math.max(bw, tw + 40);
  const D = { x: 40, y: hh + 30 }, C = { x: 40 + bottomW, y: hh + 30 };
  const left = o.right ? 0 : (bottomW - tw) * 0.35;
  const A = { x: D.x + left, y: D.y - hh }, B = { x: A.x + tw, y: A.y };
  const Hf = { x: o.right ? A.x : A.x, y: D.y };
  return svg(bottomW + 80, hh + 70,
    poly([A, B, C, D]) +
    (o.right ? rightAngle(D, { x: 1, y: 0 }, { x: 0, y: -1 }) : line(A, Hf, true, 1.3) + rightAngle(Hf, { x: 1, y: 0 }, { x: 0, y: -1 }) + text({ x: Hf.x, y: Hf.y + 14 }, "H")) +
    text({ x: A.x - 4, y: A.y - 12 }, "A") + text({ x: B.x + 4, y: B.y - 12 }, "B") +
    text({ x: C.x + 12, y: C.y + 6 }, "C") + text({ x: D.x - 12, y: D.y + 6 }, "D") +
    text({ x: (A.x + B.x) / 2, y: A.y - 14 }, o.top, 14, "middle", true) +
    text({ x: (D.x + C.x) / 2 + 20, y: D.y + 16 }, o.bottom, 14, "middle", true) +
    text({ x: A.x + 8, y: (A.y + D.y) / 2 }, o.height, 14, "start", true),
  );
}

/* ───────────── Hình tròn tâm O ───────────── */

export function circleSvg(o: { label: string; kind: "r" | "d" }): string {
  const R = 70, c = { x: 100, y: 95 };
  const end = { x: c.x + R, y: c.y };
  const start = o.kind === "d" ? { x: c.x - R, y: c.y } : c;
  return svg(200, 190,
    `<circle cx="${c.x}" cy="${c.y}" r="${R}" fill="none" stroke="${STROKE}" stroke-width="1.8"/>` +
    `<circle cx="${c.x}" cy="${c.y}" r="2.5" fill="${STROKE}"/>` +
    line(start, end, false, 1.4) +
    text({ x: c.x - 2, y: c.y + 14 }, "O") +
    text({ x: (start.x + end.x) / 2 + (o.kind === "d" ? 20 : 0), y: c.y - 12 }, o.label, 14, "middle", true),
  );
}

/* ───────────── Hình hộp chữ nhật / hình lập phương (phối cảnh) ───────────── */

export function boxSvg(o: { length: string; width: string; height: string; lVal: number; wVal: number; hVal: number }): string {
  const [L, Wd, Hh] = scale([o.lVal, o.wVal, o.hVal], 45, 140);
  const dx = Wd * 0.55, dy = Wd * 0.45;
  const x0 = 30, y0 = 30 + dy + Hh;
  const p = {
    A: { x: x0, y: y0 }, B: { x: x0 + L, y: y0 }, C: { x: x0 + L + dx, y: y0 - dy }, D: { x: x0 + dx, y: y0 - dy },
  };
  const up = (q: Pt) => ({ x: q.x, y: q.y - Hh });
  const [A2, B2, C2, D2] = [up(p.A), up(p.B), up(p.C), up(p.D)];
  return svg(x0 + L + dx + 70, y0 + 40,
    line(p.A, p.B) + line(p.B, p.C) + line(p.C, C2) + line(B2, p.B) + line(p.A, A2) +
    line(A2, B2) + line(B2, C2) + line(C2, D2) + line(D2, A2) +
    line(p.A, p.D, true, 1.1) + line(p.D, p.C, true, 1.1) + line(p.D, D2, true, 1.1) +
    text({ x: (p.A.x + p.B.x) / 2, y: p.A.y + 16 }, o.length, 14, "middle", true) +
    text({ x: (p.B.x + p.C.x) / 2 + 12, y: (p.B.y + p.C.y) / 2 + 8 }, o.width, 14, "start", true) +
    text({ x: C2.x + 8, y: (C2.y + p.C.y) / 2 }, o.height, 14, "start", true),
  );
}

/* ───────────── Hình ghép: hình chữ nhật + nửa hình tròn ───────────── */

/** Mảnh vườn hình chữ nhật dài a, rộng b; nửa hình tròn đường kính b gắn bên phải. */
export function rectSemicircleSvg(o: { a: string; b: string; aVal: number; bVal: number }): string {
  const [w, h] = scale([o.aVal, o.bVal], 60, 190);
  const x0 = 56, y0 = 30, r = h / 2;
  return svg(x0 + w + r + 40, y0 + h + 44,
    `<path d="M${x0},${y0} H${fx(x0 + w)} A${fx(r)},${fx(r)} 0 0 1 ${fx(x0 + w)},${fx(y0 + h)} H${x0} Z" fill="none" stroke="${STROKE}" stroke-width="1.8"/>` +
    line({ x: x0 + w, y: y0 }, { x: x0 + w, y: y0 + h }, true, 1.1) +
    text({ x: x0 + w / 2, y: y0 + h + 16 }, o.a, 14, "middle", true) +
    text({ x: x0 - 8, y: y0 + h / 2 }, o.b, 14, "end", true),
  );
}

/* ───────────── Biểu đồ hình quạt ───────────── */

/** `parts`: [nhãn, phần trăm]; tổng phải là 100. */
export function pieSvg(parts: [string, number][], title?: string): string {
  const total = parts.reduce((s, [, p]) => s + p, 0);
  if (total !== 100) throw new Error(`pieSvg: tổng ${total}% khác 100%`);
  const c = { x: 110, y: (title ? 34 : 14) + 90 }, R = 85;
  // Đề in đen trắng: trắng, xám nhạt, gạch chéo, xám đậm — phân biệt được khi photo.
  const fills = ["#fff", "#cfcfcf", "url(#gach)", "#8c8c8c", "#efefef"];
  let acc = 0;
  let body = "";
  parts.forEach(([name, pct], i) => {
    const a0 = (acc / 100) * 2 * Math.PI - Math.PI / 2;
    acc += pct;
    const a1 = (acc / 100) * 2 * Math.PI - Math.PI / 2;
    const p0 = { x: c.x + R * Math.cos(a0), y: c.y + R * Math.sin(a0) };
    const p1 = { x: c.x + R * Math.cos(a1), y: c.y + R * Math.sin(a1) };
    const large = pct > 50 ? 1 : 0;
    body += `<path d="M${c.x},${c.y} L${fx(p0.x)},${fx(p0.y)} A${R},${R} 0 ${large} 1 ${fx(p1.x)},${fx(p1.y)} Z" fill="${fills[i % fills.length]}" stroke="${STROKE}" stroke-width="1.4"/>`;
    const mid = (a0 + a1) / 2;
    const lp = { x: c.x + R * 0.6 * Math.cos(mid), y: c.y + R * 0.6 * Math.sin(mid) };
    body += `<rect x="${fx(lp.x - 17)}" y="${fx(lp.y - 9)}" width="34" height="18" rx="3" fill="#fff"/>` + text(lp, `${pct}%`, 13);
    // Chú thích bên phải: ô màu + tên
    const ly = c.y - 40 + i * 24;
    body += `<rect x="215" y="${fx(ly - 7)}" width="14" height="14" fill="${fills[i % fills.length]}" stroke="${STROKE}" stroke-width="1"/>`;
    body += text({ x: 235, y: ly }, name, 13, "start");
  });
  if (title) body += text({ x: 180, y: 16 }, title, 14, "middle");
  body = `<defs><pattern id="gach" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">` +
    `<rect width="7" height="7" fill="#fff"/><line x1="0" y1="0" x2="0" y2="7" stroke="${STROKE}" stroke-width="1.4"/></pattern></defs>` + body;
  return svg(360, c.y + R + 16, body);
}

/* ───────────── Đếm hình tam giác ───────────── */

/**
 * Tam giác lớn có `k` đoạn thẳng nối đỉnh A xuống cạnh đáy BC.
 * Số tam giác = (k + 2)(k + 1) / 2 (mỗi cặp điểm trên đáy tạo một tam giác).
 */
export function fanTrianglesSvg(k: number): string {
  const A = { x: 140, y: 26 }, B = { x: 30, y: 170 }, C = { x: 250, y: 170 };
  const names = "MNPQRS";
  let body = poly([A, B, C]);
  for (let i = 1; i <= k; i++) {
    const p = { x: B.x + ((C.x - B.x) * i) / (k + 1), y: B.y };
    body += line(A, p);
    body += text({ x: p.x, y: p.y + 14 }, names[i - 1]);
  }
  body += text({ x: A.x, y: A.y - 12 }, "A") + text({ x: B.x - 10, y: B.y + 8 }, "B") + text({ x: C.x + 10, y: C.y + 8 }, "C");
  return svg(280, 196, body);
}

export const fanTriangleCount = (k: number) => ((k + 2) * (k + 1)) / 2;
