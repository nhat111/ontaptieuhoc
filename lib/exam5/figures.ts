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

/* ═════════════ Hình cho đề lớp 1–4 ═════════════ */

export type FlatShape = "tron" | "vuong" | "chunhat" | "tamgiac";

/** Các hình phẳng rời nhau xếp thành hàng (lớp 1: "Hình bên có mấy hình tam giác?"). */
export function flatShapesSvg(items: FlatShape[]): string {
  const cols = Math.min(6, items.length), cell = 62;
  const rows = Math.ceil(items.length / cols);
  const body = items.map((s, i) => {
    const cx = 16 + (i % cols) * cell + cell / 2, cy = 14 + Math.floor(i / cols) * cell + cell / 2;
    switch (s) {
      case "tron": return `<circle cx="${cx}" cy="${cy}" r="19" fill="none" stroke="${STROKE}" stroke-width="1.8"/>`;
      case "vuong": return `<rect x="${cx - 18}" y="${cy - 18}" width="36" height="36" fill="none" stroke="${STROKE}" stroke-width="1.8"/>`;
      case "chunhat": return `<rect x="${cx - 26}" y="${cy - 14}" width="52" height="28" fill="none" stroke="${STROKE}" stroke-width="1.8"/>`;
      case "tamgiac": return poly([{ x: cx, y: cy - 20 }, { x: cx + 22, y: cy + 17 }, { x: cx - 22, y: cy + 17 }]);
    }
  }).join("");
  return svg(32 + cols * cell, 28 + rows * cell, body);
}

/** Mặt đồng hồ đen trắng (đề in photo được): kim giờ ngắn, đậm; kim phút dài, mảnh. */
export function clockFaceSvg(h: number, m: number): string {
  const c = { x: 85, y: 85 }, R = 72;
  const at = (deg: number, len: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: c.x + len * Math.sin(a), y: c.y - len * Math.cos(a) };
  };
  let body = `<circle cx="${c.x}" cy="${c.y}" r="${R}" fill="none" stroke="${STROKE}" stroke-width="2.4"/>`;
  for (let i = 0; i < 60; i++) {
    const big = i % 5 === 0;
    body += line(at(i * 6, R - (big ? 9 : 5)), at(i * 6, R), false, big ? 1.8 : 0.8);
  }
  for (let i = 1; i <= 12; i++) body += text(at(i * 30, R - 21), String(i), 15);
  const hand = (cls: string, p: Pt, w: number) =>
    `<line class="${cls}" x1="${c.x}" y1="${c.y}" x2="${fx(p.x)}" y2="${fx(p.y)}" stroke="${STROKE}" stroke-width="${w}" stroke-linecap="round"/>`;
  body += hand("kim-gio", at(((h % 12) + m / 60) * 30, 36), 5) + hand("kim-phut", at(m * 6, 56), 2.4);
  body += `<circle cx="${c.x}" cy="${c.y}" r="4" fill="${STROKE}"/>`;
  return svg(170, 170, body);
}

/** Đo độ dài bằng thước: vật đặt sát vạch 0 của thước kẻ (đơn vị cm). */
export const RULER_CM = 24;
export function rulerSvg(len: number, what: string): string {
  const x0 = 24, n = Math.max(len + 2, 8), W = x0 * 2 + n * RULER_CM;
  let body = `<rect class="vat" x="${x0}" y="16" width="${len * RULER_CM}" height="22" rx="4" fill="#e5e5e5" stroke="${STROKE}" stroke-width="1.6"/>` +
    text({ x: x0 + (len * RULER_CM) / 2, y: 27 }, what, 13) +
    line({ x: x0 + len * RULER_CM, y: 38 }, { x: x0 + len * RULER_CM, y: 52 }, true, 1) +
    `<rect x="${x0 - 10}" y="52" width="${n * RULER_CM + 20}" height="44" fill="none" stroke="${STROKE}" stroke-width="1.6"/>`;
  for (let i = 0; i <= n * 2; i++) {
    const x = x0 + (i * RULER_CM) / 2;
    body += line({ x, y: 52 }, { x, y: 52 + (i % 2 ? 7 : 14) }, false, i % 2 ? 0.8 : 1.2);
    if (i % 2 === 0) body += text({ x, y: 76 }, String(i / 2), 12);
  }
  body += text({ x: x0 + n * RULER_CM - 2, y: 89 }, "cm", 11, "end", true);
  return svg(W, 108, body);
}

/** Đường gấp khúc ABCD… đi lên, đi xuống xen kẽ; số đo ghi cạnh từng đoạn. */
export function polylineSvg(segs: { label: string; val: number }[]): string {
  const lens = scale(segs.map((s) => s.val), 70, 130);
  const ang = (34 * Math.PI) / 180;
  const pts: Pt[] = [{ x: 0, y: 0 }];
  lens.forEach((L, i) => {
    const p = pts[i];
    pts.push({ x: p.x + L * Math.cos(ang), y: p.y + (i % 2 === 0 ? -1 : 1) * L * Math.sin(ang) });
  });
  const minY = Math.min(...pts.map((p) => p.y)), maxY = Math.max(...pts.map((p) => p.y));
  const P = pts.map((p) => ({ x: p.x + 40, y: p.y - minY + 34 }));
  let body = `<polyline points="${P.map((p) => `${fx(p.x)},${fx(p.y)}`).join(" ")}" fill="none" stroke="${STROKE}" stroke-width="1.8" stroke-linejoin="round"/>`;
  P.forEach((p, i) => {
    body += `<circle cx="${fx(p.x)}" cy="${fx(p.y)}" r="2.5" fill="${STROKE}"/>`;
    const top = i > 0 ? P[i - 1].y > p.y : P[1].y > p.y;
    body += text({ x: p.x, y: p.y + (top ? -14 : 16) }, "ABCDEF"[i]);
  });
  segs.forEach((s, i) => {
    const a = P[i], b = P[i + 1], mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const up = b.y < a.y;
    body += text({ x: mid.x + (up ? -10 : 10), y: mid.y - 10 }, s.label, 14, up ? "end" : "start", true);
  });
  return svg(fx(P[P.length - 1].x + 50), fx(maxY - minY + 70), body);
}

/** Các tờ tiền (vẽ đơn giản: khung chữ nhật, mệnh giá ở giữa), tối đa 3 tờ một hàng. */
export function moneySvg(notes: number[]): string {
  const w = 128, h = 60, gap = 14, per = Math.min(3, notes.length);
  const label = (v: number) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const body = notes.map((v, i) => {
    const x = 12 + (i % per) * (w + gap), y = 12 + Math.floor(i / per) * (h + gap);
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#f2f2f2" stroke="${STROKE}" stroke-width="1.6"/>` +
      `<rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" rx="3" fill="none" stroke="${STROKE}" stroke-width="0.7"/>` +
      `<text class="tien" x="${x + w / 2}" y="${y + h / 2}" font-size="17" font-weight="bold" text-anchor="middle" dominant-baseline="central" ${FONT}>${label(v)} đồng</text>`;
  }).join("");
  return svg(24 + per * w + (per - 1) * gap, 24 + Math.ceil(notes.length / per) * (h + gap) - gap, body);
}

/** `groups` cái đĩa, mỗi đĩa `per` chấm tròn (bảng nhân lớp 2). */
export function groupsSvg(groups: number, per: number): string {
  const R = 30, cell = 76;
  const SPOTS: Record<number, [number, number][]> = {
    1: [[0, 0]], 2: [[-9, 0], [9, 0]], 3: [[-10, 7], [10, 7], [0, -10]], 4: [[-9, -9], [9, -9], [-9, 9], [9, 9]],
    5: [[-11, -11], [11, -11], [0, 0], [-11, 11], [11, 11]],
  };
  const body = Array.from({ length: groups }, (_, g) => {
    const cx = 14 + g * cell + cell / 2, cy = 52;
    return `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${STROKE}" stroke-width="1.6"/>` +
      SPOTS[per].map(([dx, dy]) => `<circle class="cham" cx="${cx + dx}" cy="${cy + dy}" r="5.5" fill="${STROKE}"/>`).join("");
  }).join("");
  return svg(28 + groups * cell, 104, body);
}

/** Hình chữ nhật (hoặc hình vuông) ABCD, số đo ghi ở cạnh DC và BC; góc vuông đánh dấu. */
export function rectSvg(o: { l: string; w?: string; lVal: number; wVal: number }): string {
  const [L, W] = o.lVal === o.wVal ? [130, 130] : scale([o.lVal, o.wVal], 60, 220);
  const A = { x: 40, y: 30 }, B = { x: 40 + L, y: 30 }, C = { x: 40 + L, y: 30 + W }, D = { x: 40, y: 30 + W };
  return svg(L + 120, W + 70,
    poly([A, B, C, D]) +
    rightAngle(A, { x: 1, y: 0 }, { x: 0, y: 1 }) + rightAngle(B, { x: -1, y: 0 }, { x: 0, y: 1 }) +
    rightAngle(C, { x: -1, y: 0 }, { x: 0, y: -1 }) + rightAngle(D, { x: 1, y: 0 }, { x: 0, y: -1 }) +
    text({ x: A.x - 12, y: A.y - 8 }, "A") + text({ x: B.x + 12, y: B.y - 8 }, "B") +
    text({ x: C.x + 12, y: C.y + 8 }, "C") + text({ x: D.x - 12, y: D.y + 8 }, "D") +
    text({ x: (D.x + C.x) / 2, y: D.y + 16 }, o.l, 14, "middle", true) +
    (o.w ? text({ x: B.x + 8, y: (B.y + C.y) / 2 }, o.w, 14, "start", true) : ""),
  );
}

/**
 * Hình chữ nhật dài được chia bởi `k` đoạn thẳng đứng thành k + 1 ô (ô nào cũng dài hơn
 * rộng, để không ai cãi "đó là hình vuông"). Số hình chữ nhật = (k + 1)(k + 2) / 2.
 */
export function stripRectsSvg(k: number): string {
  const x0 = 24, y0 = 20, W = 90 * (k + 1), H = 56;
  let body = poly([{ x: x0, y: y0 }, { x: x0 + W, y: y0 }, { x: x0 + W, y: y0 + H }, { x: x0, y: y0 + H }]);
  for (let i = 1; i <= k; i++) body += line({ x: x0 + (W * i) / (k + 1), y: y0 }, { x: x0 + (W * i) / (k + 1), y: y0 + H });
  return svg(W + 48, H + 40, body);
}

export const stripRectCount = (k: number) => ((k + 1) * (k + 2)) / 2;

/** Góc đỉnh O, cạnh OA (nằm ngang) và OB, có cung nhỏ (góc vuông thì vẽ kí hiệu vuông). */
export function angleSvg(deg: number): string {
  const O = { x: 150, y: 120 }, L = 115;
  const A = { x: O.x + L, y: O.y };
  const a = (deg * Math.PI) / 180;
  const B = { x: O.x + L * Math.cos(a), y: O.y - L * Math.sin(a) };
  const r = 22, e = { x: O.x + r * Math.cos(a), y: O.y - r * Math.sin(a) };
  const mark = deg === 90
    ? rightAngle(O, { x: 1, y: 0 }, { x: 0, y: -1 }, 14)
    : `<path d="M${O.x + r},${O.y} A${r},${r} 0 0 0 ${fx(e.x)},${fx(e.y)}" fill="none" stroke="${STROKE}" stroke-width="1.1"/>`;
  return svg(300, deg > 90 ? 150 : 145,
    line(O, A, false, 1.8) + line(O, B, false, 1.8) + mark +
    text({ x: O.x, y: O.y + 16 }, "O") + text({ x: A.x + 12, y: A.y }, "A") +
    // Cạnh OB gần thẳng đứng thì chữ B đặt bên phải đầu mút, không tràn khỏi khung hình.
    text({ x: B.x + (deg > 100 ? -10 : deg >= 60 ? 14 : 10), y: deg === 180 ? B.y + 2 : Math.max(10, B.y - 10) }, "B"),
  );
}

export type QuadKind = "binhhanh" | "thoi" | "thang" | "tugiac" | "tamgiac" | "vuong" | "chunhat";

/** Đỉnh các hình nhận dạng trong ô 110 × 100. Hình thoi có hai đường chéo khác nhau (không phải hình vuông xoay). */
export const QUAD_POINTS: Record<QuadKind, [number, number][]> = {
  binhhanh: [[32, 25], [104, 25], [78, 80], [6, 80]],
  thoi: [[55, 8], [100, 50], [55, 92], [10, 50]],
  thang: [[32, 28], [78, 28], [104, 82], [6, 82]],
  tugiac: [[14, 36], [82, 14], [104, 86], [30, 74]],
  tamgiac: [[55, 14], [102, 86], [8, 86]],
  vuong: [[22, 20], [86, 20], [86, 84], [22, 84]],
  chunhat: [[8, 30], [102, 30], [102, 78], [8, 78]],
};

/** Một hàng hình đánh số "Hình 1", "Hình 2"… để hỏi "hình nào là hình bình hành?". */
export function shapesRowSvg(kinds: QuadKind[]): string {
  const cell = 128;
  const body = kinds.map((k, i) => {
    const ox = 14 + i * cell, oy = 12;
    return poly(QUAD_POINTS[k].map(([x, y]) => ({ x: ox + x, y: oy + y }))) + text({ x: ox + 55, y: oy + 112 }, `Hình ${i + 1}`, 14);
  }).join("");
  return svg(28 + kinds.length * cell, 140, body);
}

/** Biểu đồ cột: số liệu ghi trên đầu mỗi cột (chữ đậm), trục đứng chia vạch theo `step`. */
export function barChartSvg(o: { title: string; labels: string[]; values: number[]; unit: string; step: number }): string {
  const top = Math.ceil(Math.max(...o.values) / o.step) * o.step;
  const x0 = 56, y0 = 200, H = 150, bw = 44, gap = 30;
  const y = (v: number) => y0 - (v / top) * H;
  let body = text({ x: x0 + (o.labels.length * (bw + gap)) / 2, y: 16 }, o.title, 14);
  for (let v = 0; v <= top; v += o.step) {
    body += line({ x: x0, y: y(v) }, { x: x0 + o.labels.length * (bw + gap) + 10, y: y(v) }, v !== 0, v === 0 ? 1.6 : 0.6) +
      text({ x: x0 - 6, y: y(v) }, String(v), 11, "end");
  }
  body += line({ x: x0, y: y0 }, { x: x0, y: y0 - H - 14 }, false, 1.6) + text({ x: x0 - 6, y: y0 - H - 24 }, o.unit, 11, "middle", true);
  o.values.forEach((v, i) => {
    const bx = x0 + gap / 2 + i * (bw + gap) + 6;
    body += `<rect x="${fx(bx)}" y="${fx(y(v))}" width="${bw}" height="${fx(y0 - y(v))}" fill="#cfcfcf" stroke="${STROKE}" stroke-width="1.2"/>` +
      `<text x="${fx(bx + bw / 2)}" y="${fx(y(v) - 9)}" font-size="13" font-weight="bold" text-anchor="middle" dominant-baseline="central" ${FONT}>${v}</text>` +
      text({ x: bx + bw / 2, y: y0 + 15 }, o.labels[i], 13);
  });
  return svg(x0 + o.labels.length * (bw + gap) + 30, y0 + 32, body);
}

/** Hình chữ nhật chia `d` phần bằng nhau (hoặc hình tròn chia `d` phần), tô các phần `shaded`. */
export function fractionSvg(d: number, shaded: number[], kind: "rect" | "circle"): string {
  const SHADE = "#bdbdbd";
  const on = new Set(shaded);
  if (kind === "rect") {
    const w = Math.min(60, 300 / d), H = 60, x0 = 20, y0 = 16;
    const body = Array.from({ length: d }, (_, i) =>
      `<rect x="${fx(x0 + i * w)}" y="${y0}" width="${fx(w)}" height="${H}" fill="${on.has(i) ? SHADE : "#fff"}" stroke="${STROKE}" stroke-width="1.6"/>`).join("");
    return svg(fx(x0 * 2 + d * w), H + 32, body);
  }
  const c = { x: 80, y: 80 }, R = 64;
  const body = Array.from({ length: d }, (_, i) => {
    const a0 = (i / d) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2;
    const p0 = { x: c.x + R * Math.cos(a0), y: c.y + R * Math.sin(a0) }, p1 = { x: c.x + R * Math.cos(a1), y: c.y + R * Math.sin(a1) };
    return `<path d="M${c.x},${c.y} L${fx(p0.x)},${fx(p0.y)} A${R},${R} 0 0 1 ${fx(p1.x)},${fx(p1.y)} Z" fill="${on.has(i) ? SHADE : "#fff"}" stroke="${STROKE}" stroke-width="1.6"/>`;
  }).join("");
  return svg(160, 160, body);
}

/* ═════════════ Hình cho Toán 3 theo bài sách (lib/mathGen/kntt/lop3.ts) ═════════════
   Mỗi hình mang thuộc tính data-… ghi số liệu đã vẽ, để scripts/sgk-toan-check.ts đọc
   ngược lại từ hình mà kiểm tra đáp án (không ảnh hưởng hình hiển thị). */

/** Các điểm trên một đường thẳng; `unit` > 0 thì vẽ vạch chia mỗi đơn vị để đếm. */
export function pointsOnLineSvg(pts: { label: string; pos: number }[], unit = 0): string {
  const step = 30, x0 = 30;
  const max = Math.max(...pts.map((p) => p.pos));
  const X = (pos: number) => x0 + pos * step;
  let body = line({ x: X(0) - 14, y: 50 }, { x: X(max) + 14, y: 50 }, false, 1.6);
  if (unit) for (let i = 0; i <= max; i++) body += line({ x: X(i), y: 45 }, { x: X(i), y: 55 }, false, 0.9);
  for (const p of pts) {
    body += `<circle cx="${X(p.pos)}" cy="50" r="3.5" fill="${STROKE}" data-p="${esc(p.label)}:${p.pos}"/>` +
      text({ x: X(p.pos), y: 30 }, p.label, 16);
  }
  return svg(X(max) + 30, 80, body);
}

/** Hình tròn tâm O: bán kính O–r, đường kính d1–d2 (qua O), dây cung c1–c2 (không qua O). */
export function circleRadiusSvg(o: { r: string; d1: string; d2: string; c1: string; c2: string }): string {
  const c = { x: 110, y: 105 }, R = 80;
  const at = (deg: number) => ({ x: c.x + R * Math.cos((deg * Math.PI) / 180), y: c.y - R * Math.sin((deg * Math.PI) / 180) });
  const lab = (deg: number, s: string) => {
    const a = (deg * Math.PI) / 180;
    return text({ x: c.x + (R + 14) * Math.cos(a), y: c.y - (R + 14) * Math.sin(a) }, s);
  };
  const r = at(65), d1 = at(160), d2 = at(340), c1 = at(215), c2 = at(285);
  return svg(220, 210,
    `<circle cx="${c.x}" cy="${c.y}" r="${R}" fill="none" stroke="${STROKE}" stroke-width="1.8"/>` +
    `<circle cx="${c.x}" cy="${c.y}" r="2.5" fill="${STROKE}"/>` +
    line(c, r, false, 1.4) + line(d1, d2, false, 1.4) + line(c1, c2, false, 1.4) +
    text({ x: c.x + 2, y: c.y + 14 }, "O") +
    lab(65, o.r) + lab(160, o.d1) + lab(340, o.d2) + lab(215, o.c1) + lab(285, o.c2),
  );
}

/** Nhiệt kế chia độ C từ 20 đến 45, vạch nhỏ mỗi độ, ghi số mỗi 5 độ. */
export function thermometerSvg(t: number): string {
  const y = (v: number) => 236 - (v - 20) * 8;
  let body = `<rect x="64" y="24" width="14" height="222" rx="7" fill="#fff" stroke="${STROKE}" stroke-width="1.6"/>` +
    `<rect data-t="${t}" x="68" y="${y(t)}" width="6" height="${250 - y(t)}" fill="#8a8a8a"/>` +
    `<circle cx="71" cy="252" r="13" fill="#8a8a8a" stroke="${STROKE}" stroke-width="1.6"/>`;
  for (let v = 20; v <= 45; v++) {
    const big = v % 5 === 0;
    body += line({ x: 78, y: y(v) }, { x: 78 + (big ? 14 : 7), y: y(v) }, false, big ? 1.3 : 0.8);
    if (big) body += text({ x: 98, y: y(v) }, String(v), 13, "start");
  }
  body += text({ x: 71, y: 12 }, "°C", 14);
  return svg(140, 275, body);
}

/** Tờ lịch một tháng, tuần bắt đầu từ thứ Hai. */
export function calendarSvg(year: number, month: number): string {
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const first = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7; // 0 = thứ Hai
  const rows = Math.ceil((first + days) / 7), cw = 40, ch = 30, x0 = 10, y0 = 66;
  let body = text({ x: x0 + 3.5 * cw, y: 18 }, `THÁNG ${month} – ${year}`, 16) +
    `<rect x="${x0}" y="${y0 - ch}" width="${7 * cw}" height="${(rows + 1) * ch}" fill="none" stroke="${STROKE}" stroke-width="1.4"/>`;
  ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].forEach((d, i) => { body += text({ x: x0 + i * cw + cw / 2, y: y0 - ch / 2 }, d, 13); });
  body += line({ x: x0, y: y0 }, { x: x0 + 7 * cw, y: y0 }, false, 1.2);
  for (let d = 1; d <= days; d++) {
    const i = first + d - 1;
    body += text({ x: x0 + (i % 7) * cw + cw / 2, y: y0 + Math.floor(i / 7) * ch + ch / 2 }, String(d), 14);
  }
  return svg(x0 * 2 + 7 * cw, y0 + rows * ch + 12, `<g data-cal="${year}-${month}">${body}</g>`);
}

/** Hình tam giác ABC hoặc tứ giác ABCD, số đo ghi cạnh từng cạnh (theo thứ tự AB, BC, …). */
export function polygonSidesSvg(kind: "tamgiac" | "tugiac", labels: string[]): string {
  const P = (kind === "tamgiac" ? [[110, 22], [200, 150], [24, 150]] : [[40, 40], [190, 22], [216, 150], [20, 140]])
    .map(([x, y]) => ({ x: x + 20, y: y + 10 }));
  const cx = P.reduce((s, p) => s + p.x, 0) / P.length, cy = P.reduce((s, p) => s + p.y, 0) / P.length;
  let body = poly(P);
  P.forEach((p, i) => {
    const q = P[(i + 1) % P.length], mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
    const dx = mid.x - cx, dy = mid.y - cy, d = Math.hypot(dx, dy) || 1;
    body += text({ x: mid.x + (dx / d) * 22, y: mid.y + (dy / d) * 16 }, labels[i], 14, "middle", true);
    const vx = p.x - cx, vy = p.y - cy, v = Math.hypot(vx, vy) || 1;
    body += text({ x: p.x + (vx / v) * 14, y: p.y + (vy / v) * 12 }, "ABCD"[i]);
  });
  return svg(270, 200, body);
}

/** Hình ghép từ các ô vuông 1 cm × 1 cm, vẽ trên lưới. */
export function unitSquaresSvg(cells: [number, number][]): string {
  const s = 26, x0 = 14, y0 = 14;
  const W = Math.max(...cells.map(([x]) => x)) + 1, H = Math.max(...cells.map(([, y]) => y)) + 1;
  let body = "";
  for (let i = 0; i <= W; i++) body += line({ x: x0 + i * s, y: y0 }, { x: x0 + i * s, y: y0 + H * s }, true, 0.5);
  for (let j = 0; j <= H; j++) body += line({ x: x0, y: y0 + j * s }, { x: x0 + W * s, y: y0 + j * s }, true, 0.5);
  body += cells.map(([x, y]) =>
    `<rect class="o" x="${x0 + x * s}" y="${y0 + y * s}" width="${s}" height="${s}" fill="#d4d4d4" stroke="${STROKE}" stroke-width="1.4"/>`).join("");
  return svg(x0 * 2 + W * s, y0 * 2 + H * s, body);
}

/** Bảng số liệu hai hàng: tên (lớp, bạn…) và số liệu. */
export function dataTableSvg(o: { head: [string, string]; labels: string[]; values: number[] }): string {
  const w0 = 120, cw = 62, ch = 34, x0 = 10, y0 = 10;
  const W = w0 + o.labels.length * cw;
  let body = `<rect x="${x0}" y="${y0}" width="${W}" height="${2 * ch}" fill="none" stroke="${STROKE}" stroke-width="1.5"/>` +
    line({ x: x0, y: y0 + ch }, { x: x0 + W, y: y0 + ch }) + line({ x: x0 + w0, y: y0 }, { x: x0 + w0, y: y0 + 2 * ch });
  body += text({ x: x0 + w0 / 2, y: y0 + ch / 2 }, o.head[0], 13) + text({ x: x0 + w0 / 2, y: y0 + ch * 1.5 }, o.head[1], 13);
  o.labels.forEach((l, i) => {
    const x = x0 + w0 + i * cw;
    if (i) body += line({ x, y: y0 }, { x, y: y0 + 2 * ch }, false, 1);
    body += text({ x: x + cw / 2, y: y0 + ch / 2 }, l, 14) +
      `<text data-v="${o.values[i]}" x="${x + cw / 2}" y="${y0 + ch * 1.5}" font-size="15" font-weight="bold" text-anchor="middle" dominant-baseline="central" ${FONT}>${o.values[i]}</text>`;
  });
  return svg(W + 20, 2 * ch + 20, body);
}

/** Các băng giấy xếp thẳng hàng ở mép trái, để so sánh dài hơn – ngắn hơn (Toán 1). */
export function lengthBarsSvg(bars: { label: string; len: number }[]): string {
  const unit = 22, x0 = 46, h = 26, gap = 18, top = 14;
  let body = line({ x: x0, y: top - 6 }, { x: x0, y: top + bars.length * (h + gap) - gap + 6 }, true, 1);
  bars.forEach((b, i) => {
    const y = top + i * (h + gap);
    body += text({ x: x0 - 16, y: y + h / 2 }, b.label, 16) +
      `<rect data-l="${esc(b.label)}:${b.len}" x="${x0}" y="${y}" width="${b.len * unit}" height="${h}" rx="3" fill="#d9d9d9" stroke="${STROKE}" stroke-width="1.5"/>`;
  });
  return svg(x0 + Math.max(...bars.map((b) => b.len)) * unit + 24, top * 2 + bars.length * (h + gap) - gap, body);
}

/** Hình nhỏ của biểu đồ tranh (đen trắng), tâm (x, y). */
export type PictoIcon = "hoa" | "sao" | "tao" | "ca";
function pictoIcon(k: PictoIcon, x: number, y: number): string {
  const s = `fill="none" stroke="${STROKE}" stroke-width="1.4"`;
  switch (k) {
    case "hoa": return [0, 72, 144, 216, 288].map((a) => {
      const t = (a * Math.PI) / 180;
      return `<circle cx="${(x + 6 * Math.sin(t)).toFixed(1)}" cy="${(y - 6 * Math.cos(t)).toFixed(1)}" r="4.2" ${s}/>`;
    }).join("") + `<circle cx="${x}" cy="${y}" r="2.6" fill="${STROKE}"/>`;
    case "sao": return `<polygon points="${range10().map((i) => {
      const t = (i * 36 * Math.PI) / 180, R = i % 2 ? 4.6 : 11;
      return `${(x + R * Math.sin(t)).toFixed(1)},${(y - R * Math.cos(t)).toFixed(1)}`;
    }).join(" ")}" ${s}/>`;
    case "tao": return `<circle cx="${x}" cy="${y + 1.5}" r="9" ${s}/><path d="M${x} ${y - 7.5} q1 -5 4 -6" ${s}/>`;
    case "ca": return `<ellipse cx="${x - 2}" cy="${y}" rx="8.5" ry="5.5" ${s}/><polygon points="${x + 6},${y} ${x + 12},${y - 5} ${x + 12},${y + 5}" ${s}/><circle cx="${x - 6}" cy="${y - 1.5}" r="1.2" fill="${STROKE}"/>`;
  }
}
const range10 = () => Array.from({ length: 10 }, (_, i) => i);

/** Biểu đồ tranh: mỗi hàng một tên và một dãy hình, mỗi hình là 1 đơn vị. */
export function pictographSvg(rows: { label: string; n: number }[], icon: PictoIcon): string {
  const w0 = 74, cell = 28, rh = 34, x0 = 10, y0 = 10;
  const max = Math.max(...rows.map((r) => r.n));
  const W = w0 + Math.max(max, 4) * cell + 10;
  let body = `<rect x="${x0}" y="${y0}" width="${W}" height="${rows.length * rh}" fill="none" stroke="${STROKE}" stroke-width="1.5"/>` +
    line({ x: x0 + w0, y: y0 }, { x: x0 + w0, y: y0 + rows.length * rh }, false, 1);
  rows.forEach((r, i) => {
    const y = y0 + i * rh;
    if (i) body += line({ x: x0, y }, { x: x0 + W, y }, false, 1);
    body += `<g data-row="${esc(r.label)}:${r.n}">` + text({ x: x0 + w0 / 2, y: y + rh / 2 }, r.label, 14) +
      Array.from({ length: r.n }, (_, j) => pictoIcon(icon, x0 + w0 + 8 + cell / 2 + j * cell, y + rh / 2)).join("") + "</g>";
  });
  return svg(W + 20, rows.length * rh + 20, body);
}
