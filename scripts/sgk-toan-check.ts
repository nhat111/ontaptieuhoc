// scripts/sgk-toan-check.ts — kiểm tra Toán theo từng bài sách (lib/sgk).
// Chạy: npx tsx scripts/sgk-toan-check.ts
//  - số chủ đề, số bài liên tục; tập một đứng trước tập hai;
//  - bài trộn chỉ trỏ tới bài có thật, đứng trước nó; `mix` mỗi bài cộng đủ 10 câu;
//  - mỗi bài làm được sinh đúng 10 câu với 300 seed, cùng seed ra cùng bộ câu, không câu
//    nào trùng trong một bộ; đáp án đúng chấm là đúng, đáp án nhiễu chấm là sai
//    (bằng chính `scoreAnswer` của trang làm bài).
//  - dạng câu viết riêng theo sách (lib/mathGen/kntt, KNTT<N>): tính lại đáp án độc lập,
//    phần lớn bằng cách đọc ngược số liệu từ hình vẽ (data-… trong SVG) hoặc từ đề bài.
// Đáp án các dạng còn lại được tính lại trong scripts/gen-math-check.ts.

import { mulberry32, sign, type Draft } from "../lib/mathGen/core";
import { KNTT1, KNTT2, KNTT3 } from "../lib/mathGen";
import { EMOJI, cap } from "../lib/mathGen/shared";
import { scoreAnswer } from "../lib/quizData";
import { rowToQuestion } from "../lib/quickExam";
import { QUESTIONS_PER_LESSON, SGK_BOOKS, buildSgkRows, sgkLessons, sgkReady } from "../lib/sgk";

const SEEDS = 300;
let errors = 0;
const fail = (msg: string) => { errors++; if (errors <= 30) console.error("✗ " + msg); };

const ids = new Set<string>();
for (const book of SGK_BOOKS) {
  const { grade, topics } = book;
  if (ids.has(`${book.slug}-${grade}`)) fail(`trùng sách ${book.slug} lớp ${grade}`);
  ids.add(`${book.slug}-${grade}`);
  if (!/^[a-z0-9-]+$/.test(book.id) || !book.source) fail(`${book.id}: thiếu id hợp lệ hoặc nguồn đối chiếu`);
  topics.forEach((t, i) => {
    if (t.so !== i + 1) fail(`lớp ${grade}: chủ đề thứ ${i + 1} đánh số ${t.so}`);
    if (i > 0 && t.tap < topics[i - 1].tap) fail(`lớp ${grade}: chủ đề ${t.so} thuộc tập ${t.tap} đứng sau tập ${topics[i - 1].tap}`);
  });
  const all = sgkLessons(grade);
  all.forEach(({ lesson }, i) => { if (lesson.so !== i + 1) fail(`lớp ${grade}: bài thứ ${i + 1} đánh số ${lesson.so}`); });

  let ready = 0;
  for (const { lesson } of all) {
    const tag = `Toán ${grade} bài ${lesson.so}`;
    if (lesson.mix && lesson.mix.reduce((s, [, n]) => s + n, 0) !== QUESTIONS_PER_LESSON) fail(`${tag}: mix không cộng đủ ${QUESTIONS_PER_LESSON} câu`);
    if (lesson.mix && (lesson.luyen || lesson.thucHanh)) fail(`${tag}: bài luyện tập / thực hành không có mix riêng`);
    for (const so of lesson.tron ?? []) {
      if (!all.some((x) => x.lesson.so === so)) fail(`${tag}: trộn bài ${so} không tồn tại`);
      if (so >= lesson.so) fail(`${tag}: trộn bài ${so} đứng sau nó`);
    }
    if (!sgkReady(grade, lesson)) continue;
    ready++;

    for (let s = 0; s < SEEDS; s++) {
      const seed = `s${s}`;
      let rows;
      try {
        rows = buildSgkRows(grade, lesson, seed);
      } catch (e) {
        fail(`${tag} seed ${seed}: THROW ${(e as Error).message}`);
        break;
      }
      if (rows.length !== QUESTIONS_PER_LESSON) fail(`${tag} seed ${seed}: ${rows.length} câu`);
      if (s < 20 && JSON.stringify(buildSgkRows(grade, lesson, seed)) !== JSON.stringify(rows)) fail(`${tag}: cùng seed ra bộ câu khác`);
      const keys = rows.map((r) => r.content + "\u0000" + r.options.join("\u0000"));
      if (new Set(keys).size !== keys.length && s < 50) fail(`${tag} seed ${seed}: có câu trùng`);

      rows.forEach((row, i) => {
        const q = rowToQuestion(row, i + 1);
        const right = row.type === "short" ? row.correct_answer.split("|")[0] : row.correct_answer;
        if (!scoreAnswer(q, right)) fail(`${tag} seed ${seed}: đáp án đúng bị chấm sai — ${row.content}`);
        if (row.type === "mcq") {
          if (!row.options.includes(row.correct_answer)) fail(`${tag}: đáp án không nằm trong lựa chọn — ${row.content}`);
          for (const o of row.options) if (o !== row.correct_answer && scoreAnswer(q, o)) fail(`${tag}: nhiễu "${o}" cũng được tính đúng — ${row.content}`);
        }
        if (/undefined|NaN|\[object/.test(row.content + row.options.join())) fail(`${tag}: chuỗi lỗi — ${row.content}`);
      });
    }
  }
  console.log(`✓ Toán ${grade}: ${all.length} bài, ${ready} bài làm được trên máy`);
}

/* ───────── Tính lại đáp án các dạng KNTT<N> ───────── */

const svgOf = (d: Draft) => decodeURIComponent((d.image ?? "").replace(/^data:image\/svg\+xml;utf8,/, ""));
const answerOf = (d: Draft): string =>
  d.type === "multiple_choice" ? d.options.find((o) => o.id === d.answer)!.text
    : d.type === "fill_blank" ? d.answers[0]
      : d.type === "true_false" ? (d.answer ? "Đúng" : "Sai") : "";
const n = (s: string) => Number(s.replace(/[^\d]/g, ""));
const WD = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ nhật"];
// Thứ trong tuần tính bằng công thức Zeller (không dùng Date như generator).
function zellerMon0(y: number, m: number, d: number) {
  if (m < 3) { m += 12; y -= 1; }
  const h = (d + Math.floor((13 * (m + 1)) / 5) + (y % 100) + Math.floor((y % 100) / 4) + Math.floor(y / 400) - 2 * Math.floor(y / 100)) % 7;
  return (((h + 7) % 7) + 5) % 7; // Zeller: 0 = thứ Bảy → đổi sang 0 = thứ Hai
}
const daysIn = (y: number, m: number) => [31, (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];

function recheck3(name: string, d: Draft): string | null {
  const q = d.question, a = answerOf(d), svg = svgOf(d);
  let m: RegExpMatchArray | null;
  switch (name) {
    case "nhietDo":
      if ((m = svg.match(/data-t="(\d+)"/))) return n(a) === +m[1] ? null : `nhiệt kế ${m[1]} → ${a}`;
      if ((m = q.match(/là (\d+) °C, đến .* (tăng thêm|giảm đi) (\d+) °C/))) return +a === (m[2] === "tăng thêm" ? +m[1] + +m[3] : +m[1] - +m[3]) ? null : "tăng giảm sai";
      if ((m = q.match(/Hôm qua nhiệt độ là (\d+) °C, hôm nay nhiệt độ là (\d+) °C\. Hôm (qua|nay)/))) {
        const [x, y] = [+m[1], +m[2]];
        if ((m[3] === "qua") !== x > y) return "so sánh nóng hơn sai chiều";
        return +a === Math.abs(x - y) ? null : "hiệu nhiệt độ sai";
      }
      return null;
    case "xemLich": {
      m = svg.match(/data-cal="(\d+)-(\d+)"/);
      if (!m) return "thiếu tờ lịch";
      const [y, mo] = [+m[1], +m[2]];
      if ((m = q.match(/Ngày (\d+) tháng \d+ là thứ mấy/))) return a === WD[zellerMon0(y, mo, +m[1])] ? null : `ngày ${m[1]}/${mo}/${y} → ${a}`;
      if (/Ngày đầu tiên/.test(q)) return a === WD[zellerMon0(y, mo, 1)] ? null : "ngày đầu tháng sai";
      if ((m = q.match(/có mấy ngày (.+)\?$/))) {
        const w = WD.findIndex((x) => x.toLowerCase() === m![1].toLowerCase());
        let c = 0; for (let dd = 1; dd <= daysIn(y, mo); dd++) if (zellerMon0(y, mo, dd) === w) c++;
        return +a === c ? null : `đếm ${m[1]} sai`;
      }
      if ((m = q.match(/bên\. (.+) đầu tiên của tháng \d+ là ngày ___/))) {
        const w = WD.findIndex((x) => x.toLowerCase() === m![1].toLowerCase());
        return zellerMon0(y, mo, +a) === w && +a <= 7 ? null : "ngày đầu tiên của thứ sai";
      }
      return "dạng lịch lạ";
    }
    case "bangSoLieu": {
      const vals = [...svg.matchAll(/data-v="(\d+)"/g)].map((x) => +x[1]);
      if (vals.length !== 4) return "bảng thiếu số";
      if (/tất cả ___/.test(q)) return +a === vals.reduce((x, y) => x + y, 0) ? null : "tổng sai";
      if ((m = q.match(/ (nhiều|ít) .+ nhất\?$/))) {
        const i = d.type === "multiple_choice" ? d.options.findIndex((o) => o.id === d.answer) : -1;
        return vals[i] === (m[1] === "nhiều" ? Math.max(...vals) : Math.min(...vals)) ? null : "nhiều/ít nhất sai";
      }
      if (/nhiều hơn/.test(q)) return vals.some((x) => vals.some((y) => x - y === +a && x > y)) ? null : "hiệu sai";
      return vals.includes(+a) ? null : "đọc bảng sai";
    }
    case "dienTichO":
      if (/Diện tích hình tô màu/.test(q)) return (svg.match(/class="o"/g) ?? []).length === +a ? null : "đếm ô sai";
      if ((m = q.match(/^(\d+) cm² ([+\-×]) (\d+) cm² = ___/)) || (m = q.match(/^(\d+) cm² (×) (\d+) = ___/))) {
        const [x, op, y] = [+m[1], m[2], +m[3]];
        return +a === (op === "+" ? x + y : op === "-" ? x - y : x * y) ? null : "tính cm² sai";
      }
      return null;
    case "chuViDaGiac": {
      const sides = svg ? [...svg.matchAll(/>(\d+) cm</g)].map((x) => +x[1]) : [...q.matchAll(/= (\d+) cm/g)].map((x) => +x[1]);
      return +a === sides.reduce((x, y) => x + y, 0) && sides.length >= 3 ? null : `chu vi sai: ${sides} → ${a}`;
    }
    case "trungDiem": {
      if ((m = q.match(/dài (\d+) cm\. M là trung điểm .* AM là ___/))) return +a * 2 === +m[1] ? null : "AM sai";
      if ((m = q.match(/AM = (\d+) cm\. Độ dài đoạn thẳng AB/))) return +a === 2 * +m[1] ? null : "AB sai";
      const pos = Object.fromEntries([...svg.matchAll(/data-p="(\w):(\d+)"/g)].map((x) => [x[1], +x[2]]));
      return (a === "Đúng") === (pos.M * 2 === pos.B) ? null : "trung điểm hình sai";
    }
    case "diemOGiua": {
      const pos = Object.fromEntries([...svg.matchAll(/data-p="(\w):(\d+)"/g)].map((x) => [x[1], +x[2]]));
      m = q.match(/hai điểm (\w) và (\w)\?/)!;
      const [lo, hi] = [Math.min(pos[m[1]], pos[m[2]]), Math.max(pos[m[1]], pos[m[2]])];
      const between = Object.keys(pos).filter((k) => pos[k] > lo && pos[k] < hi);
      return between.length === 1 && between[0] === a ? null : "điểm ở giữa sai";
    }
    case "haiBuocTinh": {
      const nums = [...q.matchAll(/(\d+)/g)].map((x) => +x[1]);
      if (/nhiều hơn .* cả hai/.test(q)) return +a === 2 * nums[0] + nums[1] ? null : "nhiều hơn sai";
      if (/ít hơn .* cả hai/.test(q)) return +a === 2 * nums[0] - nums[1] ? null : "ít hơn sai";
      if (/cửa hàng có/.test(q)) return +a === nums[0] - nums[1] + nums[2] ? null : "bán nhập sai";
      if (/Mỗi hộp có/.test(q)) return +a === nums[0] * nums[1] + nums[2] ? null : "hộp lẻ sai";
      if (/gấp .* lần/.test(q)) return +a === nums[0] + nums[0] * nums[1] ? null : "gấp sai";
      if (/rót đều vào/.test(q)) return (nums[0] - nums[1]) === +a * nums[2] ? null : "chia còn lại sai";
      return "dạng hai bước lạ";
    }
    case "khaNang": {
      if (/xúc xắc/.test(q)) {
        if (/7 chấm/.test(q)) return a === "Không thể" ? null : "xúc xắc 7";
        if (/bé hơn 7/.test(q)) return a === "Chắc chắn" ? null : "xúc xắc < 7";
        return a === "Có thể" ? null : "xúc xắc 1–6";
      }
      if ((m = q.match(/các thẻ ghi số ([\d, ]+)\. .* rút được thẻ ghi (số chẵn|số lẻ|số bé hơn 10|số (\d+)):$/))) {
        const cards = m[1].split(", ").map(Number);
        const ok = (x: number) => m![2] === "số chẵn" ? x % 2 === 0 : m![2] === "số lẻ" ? x % 2 === 1 : m![2] === "số bé hơn 10" ? x < 10 : x === +m![3];
        const k = cards.filter(ok).length;
        return a === (k === cards.length ? "Chắc chắn" : k ? "Có thể" : "Không thể") ? null : "thẻ số sai";
      }
      if ((m = q.match(/^Trong hộp có (.+)\. Không nhìn .* quả bóng (\S+):$/))) {
        const colors = [...m[1].matchAll(/\d+ quả bóng (\S+)/g)].map((x) => x[1]);
        const k = colors.filter((c) => c === m![2]).length;
        return a === (k === colors.length ? "Chắc chắn" : k ? "Có thể" : "Không thể") ? null : "bóng sai";
      }
      return "dạng khả năng lạ";
    }
    case "gocVuong":
      if ((m = q.match(/Đồng hồ chỉ (\d+) giờ/))) return (a === "Góc vuông") === (+m[1] === 3 || +m[1] === 9) ? null : "góc đồng hồ sai";
      if (svg.includes("<line")) {
        // Góc vuông vẽ kí hiệu vuông (polyline), góc khác vẽ cung (path).
        return (a === "Góc vuông") === svg.includes("<polyline") ? null : "góc hình sai";
      }
      return null;
  }
  return null;
}

function recheck1(name: string, d: Draft): string | null {
  const q = d.question, a = answerOf(d), svg = svgOf(d);
  let m: RegExpMatchArray | null;
  const count = (s: string) => [...new Intl.Segmenter().segment(s)].filter((g) => g.segment.trim()).length;
  switch (name) {
    case "nhieuItBang": {
      m = q.match(/^Hàng trên: (\S+)  Hàng dưới: (\S+)  /u)!;
      const [x, y] = [count(m[1]), count(m[2])];
      return a === (x > y ? "Nhiều hơn" : x < y ? "Ít hơn" : "Bằng nhau") ? null : `đếm ${x} – ${y} → ${a}`;
    }
    case "viTri": {
      m = q.match(/xếp thành hàng: (.+?)  /u)!;
      const row = [...new Intl.Segmenter().segment(m[1])].map((g) => g.segment).filter((g) => g.trim());
      if (row.length !== 3) return "hàng không đủ 3 con";
      const EMO: Record<string, string> = { "🐶": "con chó", "🐱": "con mèo", "🐰": "con thỏ", "🐔": "con gà", "🐷": "con lợn", "🐸": "con ếch", "🐢": "con rùa" };
      const ask = q.split("  ")[1];
      if (/ở giữa\?/.test(ask)) return a === EMO[row[1]] ? null : "ở giữa sai";
      if (/^Con vật nào ở bên trái/.test(ask)) return a === EMO[row[0]] ? null : "bên trái sai";
      if (/^Con vật nào ở bên phải/.test(ask)) return a === EMO[row[2]] ? null : "bên phải sai";
      if (/ở bên nào/.test(ask)) {
        const [who, ref] = ask.match(/^(.+) ở bên nào của (.+)\?$/)!.slice(1).map((x) => x.toLowerCase());
        const i = row.findIndex((e) => EMO[e] === who), j = row.findIndex((e) => EMO[e] === ref);
        if (i < 0 || j < 0) return "không nhận ra con vật";
        return a === (i < j ? "Bên trái" : "Bên phải") ? null : "bên nào sai";
      }
      return "dạng vị trí lạ";
    }
    case "daiNganHon": {
      if ((m = q.match(/^(\S+) cao hơn (\S+), \S+ cao hơn (\S+)\. Bạn nào (cao|thấp) nhất\?$/))) return a === (m[4] === "cao" ? m[1] : m[3]) ? null : "cao thấp sai";
      const bars = [...svg.matchAll(/data-l="(\w):(\d+)"/g)].map((x) => ({ l: x[1], v: +x[2] }));
      const pickBar = /dài nhất/.test(q) ? bars.reduce((x, y) => (y.v > x.v ? y : x)) : bars.reduce((x, y) => (y.v < x.v ? y : x));
      return a === `Băng giấy ${pickBar.l}` ? null : "băng giấy sai";
    }
    case "cong21": case "cong22": case "tru21": case "tru22": {
      const nums = [...q.matchAll(/(\d+)/g)].map((x) => +x[1]);
      const [x, y] = nums;
      const cong = name.startsWith("cong");
      if (+a !== (cong ? x + y : x - y)) return "tính sai";
      if (name.endsWith("21") ? !(x >= 10 && y < 10) : !(x >= 10 && y >= 10)) return "sai kiểu số chữ số";
      if (cong ? (x % 10) + (y % 10) >= 10 : (x % 10) < (y % 10)) return "có nhớ";
      return null;
    }
  }
  return null;
}

/** Đọc số kiểu lớp 2 ("ba trăm linh năm", "bảy trăm hai mươi mốt") — viết độc lập với docSo3. */
function parseViet(s: string): number | null {
  const D: Record<string, number> = { không: 0, một: 1, mốt: 1, hai: 2, ba: 3, bốn: 4, tư: 4, năm: 5, lăm: 5, sáu: 6, bảy: 7, tám: 8, chín: 9 };
  const w = s.toLowerCase().split(" ");
  if (w[1] !== "trăm" || !(w[0] in D)) return null;
  let v = D[w[0]] * 100, i = 2;
  if (i === w.length) return v;
  if (w[i] === "linh") return i + 2 === w.length && w[i + 1] in D ? v + D[w[i + 1]] : null;
  if (w[i] === "mười") { v += 10; i++; }
  else if (w[i] in D && w[i + 1] === "mươi") { v += D[w[i]] * 10; i += 2; }
  else return null;
  if (i === w.length) return v;
  return i + 1 === w.length && w[i] in D ? v + D[w[i]] : null;
}
const KHOI_CHECK: Record<string, string> = {
  "quả bóng đá": "Khối cầu", "quả địa cầu": "Khối cầu", "viên bi": "Khối cầu", "quả bóng rổ": "Khối cầu", "quả bóng bàn": "Khối cầu",
  "lon nước ngọt": "Khối trụ", "cục pin": "Khối trụ", "khúc gỗ tròn": "Khối trụ", "ống nhựa": "Khối trụ", "lon sữa bột": "Khối trụ",
  "con xúc xắc": "Khối lập phương", "khối ru-bích": "Khối lập phương", "hộp phấn": "Khối hộp chữ nhật", "viên gạch": "Khối hộp chữ nhật", "bao diêm": "Khối hộp chữ nhật",
};
const UNIT_CM: Record<string, number> = { cm: 1, dm: 10, m: 100, km: 100000 };
const borrows = (x: number, y: number, op: "+" | "-") => {
  let c = 0, k = 0;
  for (let i = 0; i < 3; i++) {
    const [p, q] = [Math.floor(x / 10 ** i) % 10, Math.floor(y / 10 ** i) % 10];
    const v = op === "+" ? p + q + c : p - q - c;
    c = op === "+" ? +(v >= 10) : +(v < 0);
    k += c;
  }
  return k;
};

function recheck2(name: string, d: Draft): string | null {
  const q = d.question, a = answerOf(d), svg = svgOf(d);
  const nums = (s: string) => [...s.matchAll(/\d+/g)].map((x) => +x[0]);
  const N = nums(q.replace(/[Ll]ớp 2[AB]/g, ""));
  const opts = d.type === "multiple_choice" ? d.options.map((o) => o.text) : [];
  const want = (v: number | string, why: string) => (String(v) === a ? null : `${why}: ${v} ≠ ${a}`);
  const graphemes = (s: string) => [...new Intl.Segmenter().segment(s)].map((g) => g.segment).filter((g) => g.trim());
  let m: RegExpMatchArray | null;
  switch (name) {
    case "tiaSo": {
      const pts = [...svg.matchAll(/data-p="([^"]+):(\d+)"/g)].map((x) => ({ l: x[1], p: +x[2] }));
      const known = pts.filter((x) => x.l !== "?"), hole = pts.find((x) => x.l === "?")!;
      const step = (+known[1].l - +known[0].l) / (known[1].p - known[0].p);
      if (known.some((x) => +x.l !== +known[0].l + (x.p - known[0].p) * step)) return "tia số không cách đều";
      return want(+known[0].l + (hole.p - known[0].p) * step, "tia số");
    }
    case "honKem": return want(Math.abs(N[0] - N[1]), "hơn kém");
    case "them20": case "nhieuIt20": {
      const plus = /thêm|nhiều hơn/.test(q);
      if (plus ? N[0] + N[1] <= 10 : N[0] - N[1] >= 10 || N[0] <= 10) return "không qua 10";
      return want(plus ? N[0] + N[1] : N[0] - N[1], "thêm bớt");
    }
    case "kiLoGam": case "lit": {
      if ((m = q.match(/^(.+) cân nặng (\d+) kg, (.+) cân nặng (\d+) kg\. Vật nào (nặng|nhẹ) hơn\?$/))) {
        const heavier = +m[2] > +m[4] ? m[1] : m[3], lighter = +m[2] > +m[4] ? m[3] : m[1];
        return a.toLowerCase() === (m[5] === "nặng" ? heavier : lighter).toLowerCase() ? null : "nặng nhẹ sai";
      }
      if ((m = q.match(/^(\d+) (?:kg|l) ([+-]) (\d+) (?:kg|l) = ___/))) return want(m[2] === "+" ? +m[1] + +m[3] : +m[1] - +m[3], "tính");
      if (/ca đầy/.test(q)) return want(N[1], "ca 1 l");
      return want(/Cân thăng bằng|nặng hơn con|Cả hai/.test(q) ? N[0] + N[1] : N[0] - N[1], "lời văn kg / l");
    }
    case "cong21": case "cong22": case "tru21": case "tru22": {
      const [x, y] = N, cong = name.startsWith("cong");
      if (name.endsWith("21") ? !(x >= 10 && y < 10) : !(x >= 10 && y >= 10)) return "sai kiểu số chữ số";
      if (cong ? (x % 10) + (y % 10) < 10 || x + y > 100 : (x % 10) >= (y % 10)) return "không có nhớ";
      return want(cong ? x + y : x - y, "tính");
    }
    case "doanThang": {
      const pts = [...svg.matchAll(/data-p="(\w):(\d+)"/g)].map((x) => ({ l: x[1], p: +x[2] }));
      if (/bao nhiêu đoạn thẳng/.test(q)) return want(String((pts.length * (pts.length - 1)) / 2), "đếm đoạn");
      if ((m = q.match(/^Ba điểm (\w), (\w), (\w) thẳng hàng/))) {
        const three = [m[1], m[2], m[3]].map((l) => pts.find((x) => x.l === l)!).sort((u, v) => u.p - v.p);
        return want(`Điểm ${three[1].l}`, "điểm ở giữa");
      }
      const inFig = (o: string) => o.slice(-2).split("").every((l) => pts.some((x) => x.l === l));
      return inFig(a) && opts.filter(inFig).length === 1 ? null : "đoạn thẳng trong hình sai";
    }
    case "gioPhut": {
      if (/^1 ngày có/.test(q)) return want(24, "ngày giờ");
      if (/^1 giờ =/.test(q)) return want(60, "giờ phút");
      if ((m = q.match(/^(\d+) giờ (tối|chiều) còn gọi là ___/))) return want(+m[1] + 12, "giờ chiều tối");
      if ((m = q.match(/^(\d+) giờ còn gọi là:$/))) return want(`${+m[1] - 12} giờ ${+m[1] <= 16 ? "chiều" : "tối"}`, "giờ chiều tối");
      if (/Sau \d+ giờ nữa/.test(q)) return want(N[0] + N[1], "sau mấy giờ");
      return want(N[1] - N[0], "khoảng thời gian");
    }
    case "ngayThang2": {
      if ((m = q.match(/^Tháng (\d+) có bao nhiêu ngày\?$/))) return want(`${daysIn(2027, +m[1])} ngày`, "số ngày trong tháng");
      if (/Ngày kia/.test(q)) return want(N[0] + 2, "ngày kia");
      return want(N[0] + 7, "tuần sau");
    }
    case "phepNhan": {
      if ((m = q.match(/^Viết phép nhân: ([\d + ]+) = (\d+) × ___$/))) {
        const t = m[1].split(" + ").map(Number);
        return t.every((x) => x === +m![2]) ? want(t.length, "số lần") : "các số hạng khác nhau";
      }
      if ((m = q.match(/^Tổng ([\d + ]+) viết thành phép nhân là:$/))) {
        const t = m[1].split(" + ").map(Number);
        return want(`${t[0]} × ${t.length}`, "viết phép nhân");
      }
      if ((m = q.match(/^Phép tính (\d+) × (\d+) đọc là:$/))) return want(`${m[1]} nhân ${m[2]}`, "đọc phép nhân");
      return want(N[0] * N[1], "nhóm bằng nhau");
    }
    case "tenCongTru": case "tenNhan": case "tenChia": {
      if ((m = q.match(/^Trong phép (cộng|trừ|nhân|chia) (\d+) ([+\-×:]) (\d+) = (\d+), số (\d+) gọi là:$/))) {
        const [x, y, z, t] = [+m[2], +m[4], +m[5], +m[6]];
        const ok = { "+": x + y === z, "-": x - y === z, "×": x * y === z, ":": y * z === x }[m[3]];
        if (!ok) return "phép tính sai";
        const role = { cộng: ["Số hạng", "Số hạng", "Tổng"], trừ: ["Số bị trừ", "Số trừ", "Hiệu"], nhân: ["Thừa số", "Thừa số", "Tích"], chia: ["Số bị chia", "Số chia", "Thương"] }[m[1]]!;
        if (new Set([x, y, z]).size !== 3 && m[1] !== "cộng" && m[1] !== "nhân") return "hai thành phần trùng số";
        return want(role[[x, y, z].indexOf(t)], "tên gọi");
      }
      if (/^Số bị chia là/.test(q)) return want(N[0] / N[1], "thương");
      return want(N[0] * N[1], "tích");
    }
    case "phepChia": case "chia2": case "chia5": {
      const k = /^Từ phép nhân/.test(q) ? N[0] : N[1], p = /^Từ phép nhân/.test(q) ? N[2] : N[0];
      if (name === "chia2" && k !== 2) return "bảng chia 2 mà chia cho số khác";
      if (name === "chia5" && k !== 5) return "bảng chia 5 mà chia cho số khác";
      return p % k ? "chia không hết" : want(p / k, "phép chia");
    }
    case "khoiTruCau": {
      if ((m = q.match(/^(.+) có dạng khối gì\?$/))) return want(KHOI_CHECK[m[1].toLowerCase()], "khối của đồ vật");
      if ((m = q.match(/^Đồ vật nào dưới đây có dạng (khối \S+)\?$/))) {
        const k = cap(m[1]);
        return opts.filter((o) => KHOI_CHECK[o.toLowerCase()] === k).length === 1 && KHOI_CHECK[a.toLowerCase()] === k ? null : "chọn đồ vật sai";
      }
      return want(/không có mặt phẳng/.test(q) ? "Khối cầu" : "Khối trụ", "đặc điểm khối");
    }
    case "tramChucNghin": {
      if (/^10 trăm bằng/.test(q)) return want("1 nghìn", "nghìn");
      if (/chục = ___ đơn vị|trăm = ___ chục/.test(q)) return want(N[0] * 10, "đổi");
      if (/đơn vị = ___ chục/.test(q)) return want(N[0] / 10, "đổi");
      return want(N[0] / 100, "số trăm");
    }
    case "tronTramChuc": {
      if ((m = q.match(/^Số tròn (chục|trăm) liền (sau|trước) (\d+) là/))) return want(+m[3] + (m[1] === "chục" ? 10 : 100) * (m[2] === "sau" ? 1 : -1), "liền sau / trước");
      if ((m = q.match(/^Số nào là số tròn (chục|trăm)\?$/))) {
        const u = m[1] === "chục" ? 10 : 100;
        return opts.filter((o) => +o % u === 0).length === 1 && +a % u === 0 ? null : "số tròn sai";
      }
      const seq = q.replace("Điền số: ", "").split(", "), i = seq.indexOf("___"), known = seq.map(Number);
      const step = i === 1 ? known[3] - known[2] : known[1] - known[0];
      return want(i === 1 ? known[2] - step : known[i - 1] + step, "dãy số tròn");
    }
    case "soSanhTron": {
      if ((m = q.match(/^Chọn dấu thích hợp: (\d+) ___ (\d+)$/))) return want(sign(+m[1] - +m[2]), "so sánh");
      m = q.match(/^Số (lớn|bé) nhất trong các số (.+) là:$/)!;
      const list = m[2].split(", ").map(Number);
      return want(m[1] === "lớn" ? Math.max(...list) : Math.min(...list), "lớn / bé nhất");
    }
    case "docViet3": {
      if ((m = q.match(/^Số “(.+)” viết là:$/))) return want(parseViet(m[1]) ?? "?", "viết số");
      m = q.match(/^Số (\d+) đọc là:$/)!;
      if (parseViet(a) !== +m[1]) return `đọc sai: ${a}`;
      return opts.every((o) => o === a || (parseViet(o) !== null && parseViet(o) !== +m![1])) ? null : "nhiễu đọc ra cùng số hoặc đọc không được";
    }
    case "vietTong": {
      if ((m = q.match(/^(\d+) = (.+)$/))) {
        const parts = m[2].split(" + ");
        const v = +m[1] - parts.filter((x) => x !== "___").reduce((s, x) => s + +x, 0);
        return want(v, "viết thành tổng");
      }
      m = q.match(/^Số (\d+) viết thành/)!;
      const sum = (s: string) => s.split(" + ").reduce((t, x) => t + +x, 0);
      if (sum(a) !== +m[1] || a.split(" + ").some((x) => /^\d0*$/.test(x) === false)) return "tổng đúng sai";
      return opts.every((o) => o === a || sum(o) !== +m![1]) ? null : "nhiễu cũng bằng số đó";
    }
    case "donViDai": {
      if ((m = q.match(/^Chọn dấu thích hợp: (\d+) (\w+) ___ (\d+) (\w+)$/))) return want(sign(+m[1] * UNIT_CM[m[2]] - +m[3] * UNIT_CM[m[4]]), "so sánh độ dài");
      return opts.includes(a) ? null : "đơn vị không có trong lựa chọn";
    }
    case "cong1000": case "cong1000Nho": case "tru1000": case "tru1000Nho": {
      const op = name.startsWith("cong") ? "+" : "-", [x, y] = N;
      if (borrows(x, y, op) !== (name.endsWith("Nho") ? 1 : 0)) return "số lần nhớ sai";
      return want(op === "+" ? x + y : x - y, "tính");
    }
    case "kiemDem": {
      const list = graphemes(q.match(/^Đếm rồi trả lời: (\S+)  /u)![1]);
      const count = (n: string) => list.filter((g) => g === EMOJI.find((e) => e.n === n)!.e).length;
      if ((m = q.match(/  Có ___ (.+)\.$/))) return want(count(m[1]), "đếm");
      if ((m = q.match(/  Số (.+) nhiều hơn số (.+) là ___$/))) return want(count(m[1]) - count(m[2]), "hơn kém");
      m = q.match(/Loại nào có (nhiều|ít) nhất\?$/)!;
      const c = opts.map((o) => count(o.toLowerCase()));
      const best = m[1] === "nhiều" ? Math.max(...c) : Math.min(...c);
      return c.filter((x) => x === best).length === 1 ? want(opts[c.indexOf(best)], "nhiều / ít nhất") : "hai loại bằng nhau";
    }
    case "bieuDoTranh": {
      const rows: Record<string, number> = Object.fromEntries([...svg.matchAll(/data-row="([^"]+):(\d+)"/g)].map((x) => [x[1], +x[2]]));
      // Số hình vẽ trong mỗi hàng phải khớp số ghi trong data-row.
      const drawn = svg.split("<g data-row=").slice(1).map((g) => (g.match(/<circle [^>]*fill="#111"/g) ?? []).length + (g.match(/<polygon|<circle [^>]*r="9"/g) ?? []).length);
      if (/bông hoa/.test(q) && drawn.some((c, x) => c !== Object.values(rows)[x])) return "số hình hoa không khớp";
      const ask = q.replace(/^.+?\(mỗi hình là 1 [^)]+\)\. /, "");
      if (/^Cả \d+ bạn/.test(ask)) return want(Object.values(rows).reduce((s, x) => s + x, 0), "tổng");
      if ((m = ask.match(/^(\S+) .+ nhiều hơn (\S+) ___/))) return want(rows[m[1]] - rows[m[2]], "hơn kém");
      if ((m = ask.match(/^Bạn nào .+ (nhiều|ít) .+ nhất\?$/))) {
        const v = Object.values(rows), best = m[1] === "nhiều" ? Math.max(...v) : Math.min(...v);
        return want(Object.keys(rows).find((k) => rows[k] === best)!, "nhiều / ít nhất");
      }
      return want(rows[ask.split(" ")[0]], "đọc biểu đồ");
    }
  }
  return `chưa có cách tính lại dạng ${name}`;
}

// Mỗi bộ dạng câu KNTT<N> đi kèm hàm tính lại của nó. Dạng số học thuần (phép tính, so
// sánh, liền trước – liền sau) đã được scripts/gen-math-check.ts tính lại nên trả null ở đây.
const RECHECK: [string, Record<string, (r: ReturnType<typeof mulberry32>) => Draft>, (name: string, d: Draft) => string | null][] = [
  ["KNTT1", KNTT1, recheck1],
  ["KNTT2", KNTT2, recheck2],
  ["KNTT3", KNTT3, recheck3],
];
for (const [label, gens, recheck] of RECHECK) {
  for (const [name, gen] of Object.entries(gens)) {
    let bad = 0;
    for (let s = 0; s < 3000; s++) {
      const d = gen(mulberry32(s * 31 + 7));
      const err = recheck(name, d);
      if (err) { bad++; fail(`${label}.${name} seed ${s}: ${err} — ${d.question}`); if (bad > 3) break; }
    }
  }
  console.log(`✓ ${label}: đã tính lại đáp án ${Object.keys(gens).length} dạng câu`);
}

if (errors) {
  console.error(`\n${errors} lỗi`);
  process.exit(1);
}
