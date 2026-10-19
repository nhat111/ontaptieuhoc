// scripts/exam14-check.ts — kiểm tra đề Toán lớp 1–4 theo cấu trúc đề thật (lib/exam5/toan1to4.ts).
//
// 300 đề mỗi (lớp, kì). Với mỗi câu, tính lại đáp án KHÔNG dùng hàm của bộ sinh:
//   • phép tính, biểu thức (cả phân số), tìm số chưa biết, chia có dư, so sánh hai vế —
//     đọc thẳng từ chữ trong đề và tính bằng phân số hữu tỉ;
//   • câu có hình — đọc lại từ SVG: góc quay hai kim đồng hồ, chiều dài vật trên thước, số đo
//     các đoạn của đường gấp khúc, mệnh giá các tờ tiền, số chấm trên đĩa, số đoạn thẳng trong
//     hình đếm tam giác / hình chữ nhật, từng hình phẳng, số đo góc, toạ độ đỉnh các tứ giác
//     (cạnh song song, cạnh bằng nhau), số trên đầu cột biểu đồ, số phần tô màu;
//   • bài toán có lời văn mới (viết phép tính thích hợp, nhiều hơn / ít hơn, tìm số, chu vi –
//     diện tích hình chữ nhật, lập số, phân số của một số) — đọc số trong đề rồi giải lại.
// Trắc nghiệm: đáp án đúng khớp kết quả tính lại, và không đáp án nhiễu nào cũng đúng.
// Câu có hình hoặc trông như phép tính mà không tính lại được → báo lỗi (biểu thức chính
// quy không còn khớp đề). Dạng bài cũ của lib/mathGen đã có scripts/gen-math-check.ts.
//
// Chạy: npx tsx scripts/exam14-check.ts

import { EXAM_KINDS } from "../lib/quickExam";
import { buildToan1to4, toanCount, type SmallGrade } from "../lib/exam5/toan1to4";
import { QUAD_POINTS, RULER_CM } from "../lib/exam5/figures";
import { isGroup, paperRows, sectionPoints, type PaperQuestion } from "../lib/exam5/paper";

const SEEDS = 300;
const errors: string[] = [];
const fail = (msg: string) => { if (errors.length < 40) errors.push(msg); };

/* ───────────── Phân số hữu tỉ ───────────── */

type Q = { n: number; d: number };
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const q = (n: number, d = 1): Q => { const g = gcd(n, d) || 1; const s = d < 0 ? -1 : 1; return { n: (s * n) / g, d: (s * d) / g }; };
const OPS: Record<string, (a: Q, b: Q) => Q> = {
  "+": (a, b) => q(a.n * b.d + b.n * a.d, a.d * b.d),
  "-": (a, b) => q(a.n * b.d - b.n * a.d, a.d * b.d),
  "×": (a, b) => q(a.n * b.n, a.d * b.d),
  ":": (a, b) => q(a.n * b.d, a.d * b.n),
};
const eq = (a: Q, b: Q) => a.n === b.n && a.d === b.d;
const show = (a: Q) => (a.d === 1 ? String(a.n) : `${a.n}/${a.d}`);

/** "1.234" → 1234; "$\frac{2}{3}$" và "2/3" → 2/3. */
function readQ(s: string): Q | null {
  const t = s.trim();
  let m = t.match(/^\$\\frac\{(\d+)\}\{(\d+)\}\$$/) ?? t.match(/^(\d+)\/(\d+)$/);
  if (m) return q(+m[1], +m[2]);
  m = t.match(/^\d{1,3}(?:\.\d{3})*$|^\d+$/);
  return m ? q(Number(t.replace(/\./g, ""))) : null;
}
/** Số đầu tiên trong đáp án ("12 cm", "1.250 đồng", "$\frac{3}{4}$"). */
const firstQ = (s: string): Q | null => {
  const m = s.match(/\$\\frac\{\d+\}\{\d+\}\$|\d+\/\d+|\d{1,3}(?:\.\d{3})+|\d+/);
  return m ? readQ(m[0]) : null;
};

/** Biểu thức số tự nhiên / phân số với + - × : và ngoặc; nhân chia trước, cộng trừ sau. */
function evalExpr(src: string): Q | null {
  const toks = src.match(/\$\\frac\{\d+\}\{\d+\}\$|\d+\/\d+|\d{1,3}(?:\.\d{3})+|\d+|[+\-×:()]/g);
  if (!toks || toks.join("") !== src.replace(/\s+/g, "")) return null;
  let i = 0;
  const atom = (): Q | null => {
    const t = toks[i++];
    if (t === "(") { const v = sum(); i++; return v; }
    return t ? readQ(t) : null;
  };
  const prod = (): Q | null => {
    let v = atom();
    while (v && (toks[i] === "×" || toks[i] === ":")) { const op = toks[i++]; const b = atom(); if (!b || (op === ":" && b.n === 0)) return null; v = OPS[op](v, b); }
    return v;
  };
  const sum = (): Q | null => {
    let v = prod();
    while (v && (toks[i] === "+" || toks[i] === "-")) { const op = toks[i++]; const b = prod(); if (!b) return null; v = OPS[op](v, b); }
    return v;
  };
  const v = sum();
  return i === toks.length ? v : null;
}

/** Một phương trình có đúng một chỗ trống: "___ + 7 = 15", "62 - ___ = 37", "5 × ___ = 40". */
function solveBlank(lhs: string, rhs: string): Q | null {
  const m = lhs.match(/^(.+?) ([+\-×:]) (.+)$/);
  if (!m) return null;
  const [, a, op, b] = m;
  const c = evalExpr(rhs);
  if (!c) return null;
  const BL = /^(___|…)$/;
  if (BL.test(a)) { const B = evalExpr(b); if (!B) return null; return { "+": OPS["-"](c, B), "-": OPS["+"](c, B), "×": OPS[":"](c, B), ":": OPS["×"](c, B) }[op]!; }
  if (BL.test(b)) { const A = evalExpr(a); if (!A) return null; return { "+": OPS["-"](c, A), "-": OPS["-"](A, c), "×": OPS[":"](c, A), ":": OPS[":"](A, c) }[op]!; }
  return null;
}

/* ───────────── Đọc hình ───────────── */

const svgOf = (row: PaperQuestion["row"]) => {
  const u = (JSON.parse(row.explanation).images ?? [])[0]?.url as string | undefined;
  return u ? decodeURIComponent(u.replace(/^data:image\/svg\+xml;utf8,/, "")) : "";
};
const attr = (el: string, name: string) => Number(el.match(new RegExp(`\\b${name}="([-\\d.]+)"`))?.[1]);
const lines = (svg: string) => [...svg.matchAll(/<line [^>]*>/g)].map((m) => m[0]);
const polys = (svg: string) => [...svg.matchAll(/<polygon points="([^"]+)"/g)].map((m) => m[1].split(" ").map((p) => p.split(",").map(Number) as [number, number]));
const texts = (svg: string) => [...svg.matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);

function clockReading(svg: string): string | null {
  const hand = (cls: string) => {
    const el = svg.match(new RegExp(`<line class="${cls}"[^>]*>`))?.[0];
    if (!el) return null;
    const dx = attr(el, "x2") - attr(el, "x1"), dy = attr(el, "y2") - attr(el, "y1");
    return ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
  };
  const hA = hand("kim-gio"), mA = hand("kim-phut");
  if (hA === null || mA === null) return null;
  const m = Math.round(mA / 6) % 60;
  const h = Math.floor((hA - m / 2 + 1) / 30) % 12 || 12;
  return m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`;
}

type Kind4 = "tamgiac" | "binhhanh" | "thoi" | "khac";
function quadKind(pts: [number, number][]): Kind4 {
  if (pts.length === 3) return "tamgiac";
  const v = (i: number) => [pts[(i + 1) % 4][0] - pts[i][0], pts[(i + 1) % 4][1] - pts[i][1]];
  const par = (a: number[], b: number[]) => Math.abs(a[0] * b[1] - a[1] * b[0]) < 1e-6;
  const len = (a: number[]) => Math.hypot(a[0], a[1]);
  if (!(par(v(0), v(2)) && par(v(1), v(3)))) return "khac";
  return Math.abs(len(v(0)) - len(v(1))) < 1e-6 ? "thoi" : "binhhanh";
}

/** Đáp án tính lại: số (so theo giá trị) hoặc chữ (so đúng nguyên văn). null = không nhận ra dạng. */
function expected(row: PaperQuestion["row"]): Q | string | null {
  const c = row.content;
  const svg = svgOf(row);
  let m: RegExpMatchArray | null;

  /* — Câu có hình — */
  if (svg.includes("kim-gio")) return clockReading(svg);
  if (svg.includes('class="vat"')) return q(attr(svg.match(/<rect class="vat"[^>]*>/)![0], "width") / RULER_CM);
  if (svg.includes('class="tien"')) return q([...svg.matchAll(/class="tien"[^>]*>([\d.]+) đồng</g)].reduce((s, x) => s + Number(x[1].replace(/\./g, "")), 0));
  if (svg.includes('class="cham"')) {
    const dots = (svg.match(/class="cham"/g) ?? []).length, plates = (svg.match(/fill="none"/g) ?? []).length;
    m = c.match(/Có (\d+) cái đĩa, mỗi đĩa có (\d+)/);
    if (!m || +m[1] !== plates || +m[1] * +m[2] !== dots) fail(`đĩa: đề nói ${m?.[1]} × ${m?.[2]}, hình có ${plates} đĩa, ${dots} chấm`);
    return `${dots / plates} × ${plates} = ${dots}`;
  }
  if (svg.includes("<polyline points") && /đường gấp khúc/.test(c)) {
    const segs = texts(svg).filter((t) => / cm$/.test(t)).map((t) => parseInt(t, 10));
    if (segs.length + 1 !== (c.match(/ABCD|ABC/)?.[0].length ?? 0)) fail(`gấp khúc: tên ${c} nhưng hình có ${segs.length} đoạn`);
    return q(segs.reduce((s, x) => s + x, 0));
  }
  if (/^Hình bên có (bao nhiêu|___) hình (tam giác|tứ giác|chữ nhật|vuông|tròn)/.test(c)) {
    const what = c.match(/hình (tam giác|tứ giác|chữ nhật|vuông|tròn)/)![1];
    const k = lines(svg).length;
    if (k > 0) return q(((k + 1) * (k + 2)) / 2); // hình chia bởi k đoạn thẳng: đếm hình đơn và ghép
    const rects = [...svg.matchAll(/<rect x="[^>]*>/g)].map((x) => x[0]);
    const n = {
      "tròn": (svg.match(/<circle /g) ?? []).length,
      "vuông": rects.filter((x) => attr(x, "width") === attr(x, "height")).length,
      "chữ nhật": rects.filter((x) => attr(x, "width") !== attr(x, "height")).length,
      "tam giác": polys(svg).filter((p) => p.length === 3).length,
      "tứ giác": -1,
    }[what];
    return n! >= 0 ? q(n!) : null;
  }
  if (c.startsWith("Góc đỉnh O")) {
    const ls = lines(svg).slice(0, 2);
    const ob = ls[1];
    // y hướng xuống trong SVG; |dy| nhỏ quá thì coi là 0 (atan2(-0, x) ra -180°).
    const dy = attr(ob, "y1") - attr(ob, "y2"), dx = attr(ob, "x2") - attr(ob, "x1");
    const deg = Math.round((Math.atan2(Math.abs(dy) < 1e-9 ? 0 : dy, dx) * 180) / Math.PI);
    return deg < 90 ? "Góc nhọn" : deg === 90 ? "Góc vuông" : deg < 180 ? "Góc tù" : "Góc bẹt";
  }
  if ((m = c.match(/hình nào là hình (bình hành|thoi)\?/))) {
    const want = m[1] === "thoi" ? "thoi" : "binhhanh";
    const kinds = polys(svg).map(quadKind);
    // Hình thoi cũng là hình bình hành: hỏi "bình hành" thì không được có hình thoi nào.
    const hits = kinds.map((k, i) => (k === want || (want === "binhhanh" && k === "thoi") ? i : -1)).filter((i) => i >= 0);
    if (hits.length !== 1) { fail(`nhận dạng ${want}: có ${hits.length} hình thoả — ${kinds.join(",")}`); return null; }
    return `Hình ${hits[0] + 1}`;
  }
  if (c.startsWith("Biểu đồ cột")) {
    const vals = [...svg.matchAll(/font-weight="bold"[^>]*>(\d+)</g)].map((x) => +x[1]);
    const labels = texts(svg).filter((t) => /^4[A-D]$/.test(t));
    if (vals.length !== 4 || labels.length !== 4) { fail(`biểu đồ cột: đọc được ${vals.length} cột`); return null; }
    if (/nhiều .* nhất\?/.test(c)) return labels[vals.indexOf(Math.max(...vals))];
    if (/ít .* nhất\?/.test(c)) return labels[vals.indexOf(Math.min(...vals))];
    if ((m = c.match(/Lớp (4[A-D]) .* nhiều hơn lớp (4[A-D])/))) return q(vals[labels.indexOf(m[1])] - vals[labels.indexOf(m[2])]);
    const sum = vals.reduce((s, x) => s + x, 0);
    if (/Cả bốn lớp/.test(c)) return q(sum);
    if (/Trung bình mỗi lớp/.test(c)) return q(sum, 4);
    return null;
  }
  if (/phần đã tô màu|một phần mấy/.test(c)) {
    const parts = (svg.match(/<(rect x|path)[^>]*>/g) ?? []);
    return q(parts.filter((p) => p.includes("#bdbdbd")).length, parts.length);
  }
  if ((m = c.match(/^Hình tròn tâm O có (bán kính|đường kính) (\d+) cm \(như hình vẽ\)\. (Đường kính|Bán kính)/))) {
    if (!texts(svg).includes(`${m[2]} cm`)) fail(`hình tròn: hình không ghi ${m[2]} cm`);
    return m[3] === "Đường kính" ? q(2 * +m[2]) : q(+m[2], 2);
  }
  if ((m = c.match(/^Hình (vuông|chữ nhật) ABCD có (?:cạnh (\d+) cm|chiều dài (\d+) cm, chiều rộng (\d+) cm) \(như hình vẽ\)\. (Chu vi|Diện tích)/))) {
    const [l, w] = m[1] === "vuông" ? [+m[2], +m[2]] : [+m[3], +m[4]];
    if (!texts(svg).includes(`${l} cm`)) fail(`hình chữ nhật: hình không ghi ${l} cm`);
    return m[5] === "Chu vi" ? q((l + w) * 2) : q(l * w);
  }
  if (svg) return null;

  /* — Phép tính, so sánh, dãy số — */
  const body = c.replace(/^(Tính|Tính giá trị biểu thức|Tính bằng cách thuận tiện(?: nhất)?|Đặt tính rồi tính): /, "");
  if ((m = body.match(/^(.+) = (___|…)$/))) {
    const v = evalExpr(m[1]);
    if (v) return v;
    const u = m[1].match(/^(\d+) (kg|l|cm|dm) ([+-]) (\d+) \2$/);
    if (u && body.endsWith(` ${u[2]}`) === false) return OPS[u[3]](q(+u[1]), q(+u[4]));
  }
  if ((m = body.match(/^(\d+) (kg|l|cm|dm) ([+-]) (\d+) \2 = (?:___|…) \2$/))) return OPS[m[3]](q(+m[1]), q(+m[4]));
  if ((m = body.match(/^(.+) = (.+)$/)) && /___|…/.test(m[1]) && !/dư/.test(body)) { const v = solveBlank(m[1], m[2]); if (v) return v; }
  if ((m = body.match(/^([\d.]+) : (\d+) = ([\d.]+) \(dư (?:___|…)\)$/))) {
    const [a, k, qq] = [readQ(m[1])!.n, +m[2], readQ(m[3])!.n];
    const rem = a - qq * k;
    if (rem < 1 || rem >= k) fail(`chia có dư sai: ${body}`);
    return q(rem);
  }
  if ((m = c.match(/^Chọn dấu thích hợp: (.+) ___ (.+)$/))) {
    const [L, R] = [evalExpr(m[1]), evalExpr(m[2])];
    if (L && R) { const d = OPS["-"](L, R).n; return d > 0 ? ">" : d < 0 ? "<" : "="; }
    return null;
  }
  if (/^(\d+|___), (\d+|___), (\d+|___), (\d+|___), (\d+|___)$/.test(c)) {
    const xs = c.split(", ");
    const h = xs.indexOf("___");
    const nums = xs.map(Number);
    const step = h >= 2 ? nums[1] - nums[0] : nums[3] - nums[2];
    const v = nums[h === 0 ? 1 : h - 1] + (h === 0 ? -step : step);
    if (xs.some((x, i) => i !== h && Number(x) !== v + (i - h) * step)) fail(`dãy số không cách đều: ${c}`);
    return q(v);
  }
  if ((m = c.match(/^Số (lớn|bé) nhất trong các số (.+) là:$/))) {
    const xs = m[2].split(", ").map((x) => readQ(x)!.n);
    return q(m[1] === "lớn" ? Math.max(...xs) : Math.min(...xs));
  }
  if ((m = c.match(/^Số (\d+) gồm (\d+) và (?:___|…)\.?$/))) return q(+m[1] - +m[2]);

  /* — Bài toán có lời văn mới — */
  if (c.startsWith("Viết phép tính thích hợp: ")) {
    const [a, b] = [...c.matchAll(/\d+/g)].map((x) => +x[0]);
    if (/tất cả|cả hai/.test(c)) return q(a + b);
    if (/còn lại/.test(c)) return q(a - b);
    return null;
  }
  if ((m = c.match(/^Tìm một số, biết rằng lấy số đó (nhân với|chia cho|cộng với) (\d+) rồi (cộng thêm|trừ đi|nhân với) (\d+) thì được (\d+)\. Số đó là ___$/))) {
    const [, op1, a, op2, b, res] = m;
    const inv = { "cộng thêm": OPS["-"], "trừ đi": OPS["+"], "nhân với": OPS[":"], "chia cho": OPS["×"], "cộng với": OPS["-"] } as const;
    return inv[op1 as keyof typeof inv](inv[op2 as keyof typeof inv](q(+res), q(+b)), q(+a));
  }
  if ((m = c.match(/hình chữ nhật có chiều dài (\d+) (\w+), chiều rộng kém chiều dài (\d+) \2\. Tính chu vi/))) return q((2 * +m[1] - +m[3]) * 2);
  if ((m = c.match(/hình chữ nhật có chiều rộng (\d+) (\w+), chiều dài gấp (\d+) lần chiều rộng\. Tính diện tích/))) return q(+m[1] * +m[1] * +m[3]);
  if ((m = c.match(/hình chữ nhật có chiều dài (\d+) (\w+), chiều rộng (\d+) \2\. Một hình vuông có chu vi bằng/))) return q((+m[1] + +m[3]) * 2, 4);
  if ((m = c.match(/^Số (lớn|bé) nhất có (bốn|năm) chữ số khác nhau được viết từ các chữ số (.+) là ___$/))) {
    const ds = m[3].split(", ").map(Number);
    if (ds.length !== (m[2] === "bốn" ? 4 : 5) || new Set(ds).size !== ds.length) fail(`lập số: chữ số không hợp lệ — ${c}`);
    let best = m[1] === "lớn" ? -1 : Infinity;
    const perm = (left: number[], acc: number[]) => {
      if (!left.length) { if (acc[0] !== 0) { const v = Number(acc.join("")); best = m![1] === "lớn" ? Math.max(best, v) : Math.min(best, v); } return; }
      left.forEach((d, i) => perm(left.filter((_, j) => j !== i), [...acc, d]));
    };
    perm(ds, []);
    return q(best);
  }
  const F = String.raw`\$\\frac\{(\d+)\}\{(\d+)\}\$`;
  if ((m = c.match(new RegExp(`có (\\d+) (?:kg gạo|học sinh), (?:đã bán|trong đó số học sinh nữ bằng) ${F}`))) ?? (m = c.match(new RegExp(`dài (\\d+) m, người ta đã cắt đi ${F}`)))) {
    const [T, n, d] = [+m[1], +m[2], +m[3]];
    return OPS["-"](q(T), q(T * n, d));
  }
  if ((m = c.match(new RegExp(`chiều dài (\\d+) m, chiều rộng bằng ${F} chiều dài\\. Tính diện tích`)))) {
    const L = +m[1];
    return OPS["×"](q(L), q(L * +m[2], +m[3]));
  }
  if ((m = c.match(/có (\d+) .*? có (nhiều|ít) hơn .*? (\d+) [^.]*\. Hỏi/))) return OPS[m[2] === "nhiều" ? "+" : "-"](q(+m[1]), q(+m[3]));
  return null;
}

/** Câu trông như phép tính / có hình mà không tính lại được thì báo — tránh để lọt câu sai. */
const mustDerive = (row: PaperQuestion["row"]) =>
  !!svgOf(row) || /^(?:[\d.]+|___|…) [+\-×:] (?:[\d.]+|___|…) = (?:___|…|[\d.]+)$/.test(row.content) || row.content.startsWith("Viết phép tính thích hợp");

let checked = 0;
for (const g of [1, 2, 3, 4] as SmallGrade[]) {
  for (const k of EXAM_KINDS) {
    for (let s = 0; s < SEEDS; s++) {
      const paper = buildToan1to4(g, k.key, k.label, `c${s}`);
      const where = `lớp ${g} ${k.key}/c${s}`;
      if (sectionPoints(paper) !== 10) fail(`${where}: tổng điểm ${sectionPoints(paper)}`);
      if (paperRows(paper).length !== toanCount(g, k.key)) fail(`${where}: ${paperRows(paper).length} câu, toanCount = ${toanCount(g, k.key)}`);
      const qs = paper.sections.flatMap((sec) => sec.items).flatMap((it) => (isGroup(it) ? it.parts : [it]));
      for (const pq of qs) {
        const row = pq.row;
        if (/undefined|NaN|Infinity|-\d/.test(row.content + row.options.join("") + row.correct_answer)) fail(`${where}: chuỗi lỗi/số âm — ${row.content}`);
        const want = expected(row);
        if (want === null) {
          if (mustDerive(row)) fail(`${where}: không tính lại được — ${row.content}`);
          continue;
        }
        checked++;
        if (typeof want === "string") {
          if (row.correct_answer !== want) fail(`${where}: ${row.content} → "${row.correct_answer}", tính lại được "${want}"`);
          if (row.options.filter((o) => o === want).length > 1) fail(`${where}: đáp án lặp — ${row.content}`);
          continue;
        }
        const got = row.type === "mcq" ? firstQ(row.correct_answer) : readQ(row.correct_answer.split("|")[0]);
        if (!got || !eq(got, want)) { fail(`${where}: ${row.content} → ${row.correct_answer}, tính lại được ${show(want)}`); continue; }
        if (row.type === "mcq") {
          for (const o of row.options) if (o !== row.correct_answer && firstQ(o) && eq(firstQ(o)!, want)) fail(`${where}: nhiễu "${o}" cũng đúng — ${row.content}`);
        }
      }
    }
  }
}
if (checked < 4 * 4 * SEEDS * 8) fail(`chỉ tính lại được ${checked} câu — biểu thức chính quy không còn khớp đề?`);

// Hình thoi vẽ ra không được là hình vuông xoay (hai đường chéo phải khác nhau).
const [t0, , t2, t3] = QUAD_POINTS.thoi;
if (Math.hypot(t2[0] - t0[0], t2[1] - t0[1]) === Math.hypot(t3[0] - QUAD_POINTS.thoi[1][0], t3[1] - QUAD_POINTS.thoi[1][1])) fail("hình thoi mẫu là hình vuông");

if (errors.length) {
  console.error(`✗ exam14: ${errors.length} lỗi\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log(`✓ exam14: Toán lớp 1–4 × ${EXAM_KINDS.length} kì × ${SEEDS} đề; tính lại ${checked} câu khớp đáp án`);
