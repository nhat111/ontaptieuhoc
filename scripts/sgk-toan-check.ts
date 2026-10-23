// scripts/sgk-toan-check.ts — kiểm tra Toán theo từng bài sách (lib/sgk).
// Chạy: npx tsx scripts/sgk-toan-check.ts
//  - số chủ đề, số bài liên tục; tập một đứng trước tập hai;
//  - bài trộn chỉ trỏ tới bài có thật, đứng trước nó; `mix` mỗi bài cộng đủ 10 câu;
//  - mỗi bài làm được sinh đúng 10 câu với 300 seed, cùng seed ra cùng bộ câu, không câu
//    nào trùng trong một bộ; đáp án đúng chấm là đúng, đáp án nhiễu chấm là sai
//    (bằng chính `scoreAnswer` của trang làm bài).
//    Lời giải trình bày “Bài giải” phải kết thúc bằng “Đáp số: <đáp án> …”.
//  - ví dụ giải mẫu: bài làm được có 1..MAX_EXAMPLES ví dụ, không trùng, cố định, có lời giải,
//    đáp án đúng chấm là đúng.
//  - dạng câu viết riêng theo sách (lib/mathGen/kntt, KNTT<N>): tính lại đáp án độc lập,
//    phần lớn bằng cách đọc ngược số liệu từ hình vẽ (data-… trong SVG) hoặc từ đề bài.
// Đáp án các dạng còn lại được tính lại trong scripts/gen-math-check.ts.

import { mulberry32, sign, type Draft } from "../lib/mathGen/core";
import { KNTT1, KNTT2, KNTT3, KNTT4, KNTT5 } from "../lib/mathGen";
import { EMOJI, cap } from "../lib/mathGen/shared";
import { scoreAnswer } from "../lib/quizData";
import { rowToQuestion } from "../lib/quickExam";
import { MAX_EXAMPLES, QUESTIONS_PER_LESSON, SGK_BOOKS, buildSgkExamples, buildSgkRows, sgkLessons, sgkReady } from "../lib/sgk";

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

    const ex = buildSgkExamples(grade, lesson);
    if (ex.length < 1 || ex.length > MAX_EXAMPLES) fail(`${tag}: ${ex.length} ví dụ giải mẫu`);
    if (JSON.stringify(buildSgkExamples(grade, lesson)) !== JSON.stringify(ex)) fail(`${tag}: ví dụ giải mẫu không cố định`);
    if (new Set(ex.map((r) => r.content)).size !== ex.length) fail(`${tag}: ví dụ giải mẫu trùng nhau`);
    ex.forEach((row, i) => {
      const q = rowToQuestion(row, i + 1);
      if (!q.explanation?.trim()) fail(`${tag}: ví dụ ${i + 1} không có lời giải — ${row.content}`);
      const right = row.type === "short" ? row.correct_answer.split("|")[0] : row.correct_answer;
      if (!scoreAnswer(q, right)) fail(`${tag}: ví dụ ${i + 1} đáp án bị chấm sai — ${row.content}`);
    });

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
        if (row.content.startsWith("Viết phép tính thích hợp")) {
          // Lớp 1: hai số trong câu chuyện, phép tính ghi trong lời giải và đáp án phải khớp nhau.
          const [x, y] = [...row.content.matchAll(/\d+/g)].map((v) => +v[0]);
          const pm = (q.explanation ?? "").match(/^Phép tính: (\d+) ([+-]) (\d+) = (\d+)\./);
          if (!pm || +pm[1] !== x || +pm[3] !== y || +pm[4] !== (pm[2] === "+" ? x + y : x - y) || pm[4] !== right) fail(`${tag}: phép tính thích hợp sai — ${row.content}`);
        }
        const sol = q.explanation ?? "";
        if (sol.startsWith("Bài giải") && !sol.match(/\nĐáp số: (.+)\.$/)?.[1].startsWith(right)) fail(`${tag}: “Đáp số” không khớp đáp án ${right} — ${row.content}`);
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
    // Bài toán có lời văn mới (lvTinh3 …): tính lại từ số trong đề, đáp án viết có dấu chấm nghìn.
    case "lvNhan2": case "lvChia2": case "lvNhan3": case "lvChia3": case "lvCong4": case "lvTru4": case "lvNhan4": case "lvChia4":
    case "lvCong5": case "lvTru5": case "lvNhan5": case "lvChia5": {
      const N3 = numsOf(q), op = name.slice(2, -1);
      const v = op === "Cong" ? 2 * N3[0] + N3[1] : op === "Tru" ? N3[0] - N3[1] - N3[2] : op === "Nhan" ? N3[0] * N3[1] : N3[0] / N3[1];
      if (!Number.isInteger(v) || v <= 0) return `kết quả không là số tự nhiên: ${v}`;
      const d3 = +name.slice(-1);
      if (String(v).length > d3) return `kết quả vượt số có ${d3} chữ số: ${v}`;
      return n(a) === v ? null : `${name}: ${v} ≠ ${a}`;
    }
    case "lvChiaDu": {
      const [x, k] = numsOf(q.replace("Lớp 3A", ""));
      if (x % k === 0) return "chia hết, không phải chia có dư";
      return n(a) === (/ít nhất/.test(q) ? Math.floor(x / k) + 1 : Math.floor(x / k)) ? null : "chia có dư sai";
    }
    case "lvMm": { const [x, y] = numsOf(q); return n(a) === x - y ? null : "mi-li-mét sai"; }
    case "lvGam": { const [x, y] = numsOf(q); return n(a) === 2 * x + y && 2 * x + y <= 1000 ? null : "gam sai"; }
    case "lvMl": { const [x, k, c] = numsOf(q); return n(a) === x - k * c && x - k * c > 0 ? null : "mi-li-lít sai"; }
    case "lvChuVi3": {
      if (/hình vuông/.test(q)) return n(a) === numsOf(q)[0] * 4 ? null : "chu vi hình vuông sai";
      const [x, y] = numsOf(q); return n(a) === (x + y) * 2 ? null : "chu vi hình chữ nhật sai";
    }
    case "lvDienTich3": { const [x, k] = numsOf(q); return n(a) === x * (x - k) ? null : "diện tích sai"; }
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
    case "lvDoDai2": {
      if ((m = q.match(/dài (\d+) m\. .* đi được (\d+) m\./))) return want(+m[1] - +m[2], "quãng đường còn lại");
      return want(N[0] + N[1], "cộng độ dài");
    }
    case "lvTien2": {
      const [x, y] = numsOf(q);
      const v = /còn lại/.test(q) ? x - y : x + y;
      return String(v) === a.replace(/\./g, "") ? null : `tiền Việt Nam: ${v} ≠ ${a}`;
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

/** Đọc một nhóm (≤ 999) bằng chữ — viết độc lập với docNhom. */
function parseNhom(w: string[]): number | null {
  const D: Record<string, number> = { không: 0, một: 1, mốt: 1, hai: 2, ba: 3, bốn: 4, tư: 4, năm: 5, lăm: 5, sáu: 6, bảy: 7, tám: 8, chín: 9 };
  if (w.length === 0) return null;
  let v = 0, i = 0;
  if (w[1] === "trăm") { if (!(w[0] in D)) return null; v = D[w[0]] * 100; i = 2; }
  if (i === w.length) return v;
  if (w[i] === "linh") return i + 2 === w.length && w[i + 1] in D ? v + D[w[i + 1]] : null;
  if (w[i] === "mười") { v += 10; i++; }
  else if (w[i] in D && w[i + 1] === "mươi") { v += D[w[i]] * 10; i += 2; }
  else if (i === 0 && w.length === 1 && w[0] in D) return D[w[0]];
  else return null;
  if (i === w.length) return v;
  return i + 1 === w.length && w[i] in D ? v + D[w[i]] : null;
}
function parseVietLon(s: string): number | null {
  let total = 0, acc: string[] = [];
  for (const t of s.toLowerCase().split(" ")) {
    if (t === "triệu" || t === "nghìn") {
      const g = parseNhom(acc);
      if (g === null) return null;
      total += g * (t === "triệu" ? 1e6 : 1000);
      acc = [];
    } else acc.push(t);
  }
  if (acc.length) { const g = parseNhom(acc); if (g === null) return null; total += g; }
  return total;
}
const numsOf = (s: string) => [...s.matchAll(/\d{1,3}(?:\.\d{3})+|\d+/g)].map((x) => Number(x[0].replace(/\./g, "")));
const evalExpr = (s: string) => Function(`return (${s.replace(/(\d)\.(?=\d{3})/g, "$1").replace(/×/g, "*").replace(/:/g, "/")})`)() as number;
const gcd2 = (a: number, b: number): number => (b ? gcd2(b, a % b) : a);

function recheck4(name: string, d: Draft): string | null {
  const q = d.question, a = answerOf(d), svg = svgOf(d), N = numsOf(q), A = numsOf(a)[0];
  const opts = d.type === "multiple_choice" ? d.options.map((o) => o.text) : [];
  const want = (v: number | string, why: string) => (typeof v === "number" ? (A === v ? null : `${why}: ${v} ≠ ${a}`) : v === a ? null : `${why}: ${v} ≠ ${a}`);
  let m: RegExpMatchArray | null;
  switch (name) {
    // Bài toán có lời văn mới: tính lại từ số liệu trong đề.
    case "lvKhoiLuong4": {
      m = q.match(/chở (\d+) tấn (\d+) tạ gạo, .* ít hơn xe thứ nhất (\d+) tạ/)!;
      const x1 = +m[1] * 10 + +m[2];
      return want(x1 + x1 - +m[3], "yến tạ tấn");
    }
    case "lvLatGach": {
      m = q.match(/chiều dài (\d+) m, chiều rộng (\d+) m\. .* cạnh (\d+) dm/)!;
      const S = (+m[1] * 10) * (+m[2] * 10), g = Number(m[3]) ** 2;
      return S % g ? "không lát vừa số viên nguyên" : want(S / g, "số viên gạch");
    }
    case "lvGiay": {
      m = q.match(/hết (\d+) phút (\d+) giây, Hùng chạy hết (\d+) giây/)!;
      return want(+m[1] * 60 + +m[2] - +m[3], "giây");
    }
    case "lvCongPS": case "lvTruPS": case "lvNhanPS": case "lvChiaPS": {
      const F = [...q.matchAll(/(\d+)\/(\d+)/g)].map((x) => +x[1] / +x[2]);
      const v = name === "lvCongPS" ? F[0] + F[1] : name === "lvTruPS" ? F[0] - F[1] : name === "lvNhanPS" ? F[0] * F[1] : F[0] / F[1];
      const val = (o: string) => { const x = o.match(/^(\d+)\/(\d+)$/)!; return +x[1] / +x[2]; };
      const [an, ad] = a.split("/").map(Number);
      if (gcd2(an, ad) !== 1) return `đáp án chưa tối giản: ${a}`;
      if (opts.filter((o) => Math.abs(val(o) - v) < 1e-9).length !== 1) return "nhiễu bằng giá trị đáp án";
      return Math.abs(val(a) - v) < 1e-9 ? null : `${name}: ${v} ≠ ${a}`;
    }
    case "chanLe": {
      if ((m = q.match(/^Số nào dưới đây là số (chẵn|lẻ)\?$/))) {
        const p = m[1] === "chẵn" ? 0 : 1, ok = (o: string) => numsOf(o)[0] % 2 === p;
        return ok(a) && opts.filter(ok).length === 1 ? null : "chẵn lẻ sai";
      }
      if ((m = q.match(/^Từ (\d+) đến (\d+) có ___ số (chẵn|lẻ)\.$/))) {
        let c = 0;
        for (let x = +m[1]; x <= +m[2]; x++) if (x % 2 === (m[3] === "chẵn" ? 0 : 1)) c++;
        return want(c, "đếm chẵn lẻ");
      }
      m = q.match(/^Số (chẵn|lẻ) liền (sau|trước) số /)!;
      if (N[0] % 2 !== (m[1] === "chẵn" ? 0 : 1)) return "số đã cho sai tính chẵn lẻ";
      return want(N[0] + (m[2] === "sau" ? 2 : -2), "liền sau / trước");
    }
    case "bieuThucChu": {
      if ((m = q.match(/^Giá trị của biểu thức (.+) với a = (\d+) là ___$/))) return want(evalExpr(m[1].replace(/a/g, m[2])), "biểu thức chứa chữ");
      if ((m = q.match(/với a = (\d+), b = (\d+) là ___$/))) return want(+m[1] + +m[2], "a + b");
      return want(N[N.length - 1] * 4, "chu vi hình vuông");
    }
    case "baBuoc": {
      if (/^Kho có/.test(q)) return want(N[0] - N[1] - N[2] + N[3], "kho");
      if (/thùng, mỗi thùng/.test(q)) return want(N[0] * N[1] - N[2] + N[3], "thùng");
      return want(N[3] - N[0] * N[1] - N[2], "mua vở");
    }
    case "doGoc": {
      if ((m = svg.match(/data-deg="(\d+)"/))) return want(`${m[1]}°`, "đọc thước đo góc");
      if (/^Góc vuông/.test(q)) return want("90°", "góc vuông");
      if (/^Góc bẹt có/.test(q)) return want("180°", "góc bẹt");
      return want("2 góc vuông", "góc bẹt bằng mấy góc vuông");
    }
    case "loaiGoc": { const g = N[0]; return want(g < 90 ? "Góc nhọn" : g === 90 ? "Góc vuông" : g < 180 ? "Góc tù" : "Góc bẹt", "loại góc"); }
    case "docVietSo6": case "docVietSo9": {
      if (/^Số liền sau số 999\.999/.test(q)) return want(1000000, "số liền sau");
      if ((m = q.match(/^Số “(.+)” viết là:$/))) {
        const v = parseVietLon(m[1]);
        return v === A && opts.every((o) => o === a || numsOf(o)[0] !== v) ? null : `viết số: ${v} ≠ ${a}`;
      }
      const n = N[0];
      if (parseVietLon(a) !== n) return `đọc số sai: ${a}`;
      return opts.every((o) => o === a || (parseVietLon(o) !== null && parseVietLon(o) !== n)) ? null : "nhiễu đọc ra cùng số hoặc đọc không được";
    }
    case "daySoTN": {
      if (/bé nhất/.test(q)) return want("0", "số bé nhất");
      if ((m = q.match(/liền (sau|trước) số/))) return want(N[0] + (m[1] === "sau" ? 1 : -1), "liền sau / trước");
      if (/^Từ \d+ đến \d+ có ___ số tự nhiên/.test(q)) return want(N[1] - N[0] + 1, "đếm số tự nhiên");
      const seq = q.replace("Điền số: ", "").split("; "), i = seq.indexOf("___"), k = seq.map((x) => Number(x.replace(/\./g, "")));
      const step = i === 1 ? k[3] - k[2] : k[1] - k[0];
      return want(i === 1 ? k[2] - step : k[i - 1] + step, "dãy số");
    }
    case "tinhChatCong": case "tinhChatNhan": case "phanPhoi": {
      const [l, r] = q.replace("___", a).split(" = ");
      return evalExpr(l) === evalExpr(r) ? null : "hai vế không bằng nhau";
    }
    case "vuongGoc": case "songSong": {
      if (/mấy góc vuông/.test(q)) return want("4", "số góc vuông");
      if (/song song với nhau thì/.test(q)) return want("Không bao giờ cắt nhau", "song song");
      m = q.match(/^Hình (?:vuông|chữ nhật) (\w{4}) .+: cạnh (\w\w) (vuông góc|song song) với/)!;
      const s = m[1], e = m[2];
      const sides = [0, 1, 2, 3].map((i) => s[i] + s[(i + 1) % 4]);
      const shares = (x: string) => x !== e && [...x].some((c) => e.includes(c));
      return m[3] === "song song"
        ? want(sides.find((x) => x !== e && !shares(x))!, "cạnh song song")
        : want(sides.filter(shares).sort().join(" và "), "cạnh vuông góc");
    }
    case "hbhThoi": {
      if (/^Hình bình hành có đặc điểm/.test(q)) return want("Hai cặp cạnh đối diện song song và bằng nhau", "hình bình hành");
      if (/^Hình thoi có đặc điểm/.test(q)) return want("Hai cặp cạnh đối diện song song và bốn cạnh bằng nhau", "hình thoi");
      return /hình thoi/.test(q) ? want(N[0] * 4, "chu vi hình thoi") : want((N[0] + N[1]) * 2, "chu vi hình bình hành");
    }
    case "rutVeDonVi": return N[1] % N[0] ? "không chia hết" : want((N[1] / N[0]) * N[2], "rút về đơn vị");
    case "daySoLieu": {
      const lop = q.match(/các lớp (.+?) lần lượt/)![1].split(", ");
      const vals = q.match(/lần lượt là: ([\d; ]+)\./)![1].split("; ").map(Number);
      if (lop.length !== vals.length) return "số lớp khác số số liệu";
      if (/có ___ số liệu/.test(q)) return want(vals.length, "số số liệu");
      if ((m = q.match(/Số liệu thứ (\d+)/))) return want(vals[+m[1] - 1], "số liệu thứ k");
      if ((m = q.match(/Lớp nào có (nhiều|ít)/))) return want(lop[vals.indexOf(m[1] === "nhiều" ? Math.max(...vals) : Math.min(...vals))], "lớp nhiều / ít nhất");
      return want(Math.max(...vals) - Math.min(...vals), "chênh lệch");
    }
    case "soLanXuatHien": {
      if ((m = q.match(/\): ([SN, ]+)\. Mặt (sấp|ngửa)/))) return want(m[1].split(", ").filter((x) => x === (m![2] === "sấp" ? "S" : "N")).length, "đếm S/N");
      return N[1] < N[0] ? want(N[0] - N[1], "số lần còn lại") : "số lần lớn hơn tổng";
    }
    case "docPhanSo": {
      if ((m = q.match(/^Phân số (\d+)\/(\d+) đọc là:$/))) {
        const [t, mau] = a.toLowerCase().split(" phần ").map((x) => parseNhom(x.split(" ")));
        return t === +m[1] && mau === +m[2] ? null : `đọc phân số sai: ${a}`;
      }
      if ((m = q.match(/^Phân số “(.+)” viết là:$/))) {
        const [t, mau] = m[1].split(" phần ").map((x) => parseNhom(x.split(" ")));
        return want(`${t}/${mau}`, "viết phân số");
      }
      return want(/tử số/.test(q) ? N[0] : N[1], "tử / mẫu");
    }
    case "thuongPhanSo": {
      if (/^Viết thương/.test(q)) return want(`${N[0]}/${N[1]}`, "thương dạng phân số");
      if (/bằng số tự nhiên/.test(q)) return N[0] % N[1] ? "không chia hết" : want(N[0] / N[1], "phân số bằng số tự nhiên");
      const big = (o: string) => { const [x, y] = numsOf(o); return x > y; };
      return big(a) && opts.filter(big).length === 1 ? null : "lớn hơn 1 sai";
    }
    case "tinhChatPS": {
      if ((m = q.match(/^(\d+)\/(\d+) = ___\/(\d+)$/))) return (+m[1] * +m[3]) % +m[2] ? "không nhân được" : want((+m[1] * +m[3]) / +m[2], "tử số mới");
      m = q.match(/^(\d+)\/(\d+) = (\d+)\/___$/)!;
      return (+m[2] * +m[3]) % +m[1] ? "không chia được" : want((+m[2] * +m[3]) / +m[1], "mẫu số mới");
    }
    case "quyDong": {
      m = q.match(/(\d+)\/(\d+) và (\d+)\/(\d+)/)!;
      const [d1, d2] = [+m[2], +m[4]], lcm = (d1 * d2) / gcd2(d1, d2);
      if (/^Mẫu số chung bé nhất/.test(q)) return want(lcm, "mẫu số chung bé nhất");
      const t = q.match(/: (\d+)\/(\d+) = ___\/(\d+)$/)!;
      return want((+t[1] * +t[3]) / +t[2], "quy đồng");
    }
    case "phanSoCuaSo": {
      if ((m = q.match(/^(\d+)\/(\d+) giờ = ___ phút$/))) return want((60 * +m[1]) / +m[2], "phân số của giờ");
      m = q.match(/(\d+)\/(\d+)/)!;
      const x = /^\d+\/\d+ của (\d+)/.test(q) ? +q.match(/của (\d+)/)![1] : N[1];
      return (x * +m[1]) % +m[2] ? "không chia hết" : want((x * +m[1]) / +m[2], "phân số của một số");
    }
  }
  return `chưa có cách tính lại dạng ${name}`;
}

/** "1.234,56" → 1234.56 */
const vn = (s: string) => Number(s.replace(/\./g, "").replace(",", "."));
const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;

function recheck5(name: string, d: Draft): string | null {
  const q = d.question, a = answerOf(d), N = numsOf(q);
  const opts = d.type === "multiple_choice" ? d.options.map((o) => o.text) : [];
  const want = (v: number | string, why: string) => (typeof v === "number" ? (near(vn(a), v) ? null : `${why}: ${v} ≠ ${a}`) : v === a ? null : `${why}: ${v} ≠ ${a}`);
  let m: RegExpMatchArray | null;
  switch (name) {
    case "phanSoTP": {
      const tp = (o: string) => /^\d+\/(10|100|1\.000)$/.test(o);
      return tp(a) && opts.filter(tp).length === 1 ? null : "phân số thập phân sai";
    }
    case "vietSTP": {
      const v = (q.match(/(\d+) đơn vị/) ? +q.match(/(\d+) đơn vị/)![1] : 0) + (q.match(/(\d+) phần mười/) ? +q.match(/(\d+) phần mười/)![1] / 10 : 0) + (q.match(/(\d+) phần trăm/) ? +q.match(/(\d+) phần trăm/)![1] / 100 : 0);
      return want(v, "viết số thập phân");
    }
    case "lamTronSTP": {
      m = q.match(/^Làm tròn số ([\d.,]+) đến hàng (đơn vị|phần mười|phần trăm)/)!;
      const places = { "đơn vị": 0, "phần mười": 1, "phần trăm": 2 }[m[2]]!;
      const x = vn(m[1]), f = 10 ** places;
      // Làm tròn nửa lên trên số nguyên (tránh lỗi float khi nhân).
      const scaled = Math.round(x * f * 1000) / 1000, v = Math.floor(scaled + 0.5) / f;
      const shownPlaces = (a.split(",")[1] ?? "").length;
      if (shownPlaces !== places) return `số chữ số thập phân của đáp án sai: ${a}`;
      if (opts.filter((o) => near(vn(o), v) && (o.split(",")[1] ?? "").length === places).length !== 1) return "có hai lựa chọn đúng";
      return want(v, "làm tròn");
    }
    case "kmHa": {
      const x = vn(q.split(" ")[0]);
      if (/km² = ___ ha/.test(q)) return want(x * 100, "km² → ha");
      if (/ha = ___ m²/.test(q)) return want(x * 10000, "ha → m²");
      if (/ha = ___ km²/.test(q)) return want(x / 100, "ha → km²");
      return want(x / 10000, "m² → ha");
    }
    case "tiSo": {
      if ((m = q.match(/^Viết thành tỉ số phần trăm: (\d+)\/(\d+) = ___%$/))) return want((+m[1] * 100) / +m[2], "phần trăm");
      const [x, y] = numsOf(q.replace("Lớp 5A", "")).slice(-2);
      return want(`${x} : ${y}`, "tỉ số");
    }
    case "tiLeBanDo": {
      const S = numsOf(q.match(/tỉ lệ 1 : ([\d.]+)/)![1])[0];
      const toCm = (v: number, u: string) => v * (u === "km" ? 100000 : 100);
      if ((m = q.match(/dài (\d+) cm\. Độ dài thật của đoạn đường đó là ___ (m|km)\./))) return want((+m[1] * S) / (m[2] === "km" ? 100000 : 100), "độ dài thật");
      m = q.match(/^Quãng đường thật dài ([\d.]+) (m|km)\./)!;
      return want(toCm(vn(m[1]), m[2]) / S, "độ dài trên bản đồ");
    }
    case "phanTramLoiVan": {
      const base = N[0], p = +q.match(/(\d+)%/)![1];
      return want((base * p) / 100, "phần trăm của một số");
    }
    case "theTichHinh": {
      if ((m = q.match(/mỗi hàng (\d+) hình, mỗi lớp (\d+) hàng, xếp (\d+) lớp/))) return want(+m[1] * +m[2] * +m[3], "đếm hình lập phương");
      m = q.match(/Hình A gồm (\d+) .+ hình B gồm (\d+)/)!;
      return want(+m[1] > +m[2] ? "Hình A" : "Hình B", "so sánh thể tích");
    }
    case "donViTheTich": {
      if ((m = q.match(/^Chọn đơn vị thích hợp: .+ (\d+) …$/))) {
        // Độ lớn hợp lí của vật (tính ra cm³) theo từng đơn vị — đáp án đúng phải là đơn vị duy nhất cho ra cỡ hợp lí.
        const RANGE: [RegExp, number, number][] = [
          [/xúc xắc/, 0.5, 30], [/hộp sữa/, 50, 1000], [/hộp bút/, 100, 3000],
          [/can nước|thùng xốp/, 5000, 100000], [/bể bơi|phòng học|xe chở cát/, 1e6, 1e9],
        ];
        const rg = RANGE.find(([re]) => re.test(q))!;
        const U: Record<string, number> = { "cm³": 1, "dm³": 1000, "m³": 1e6 };
        const ok = opts.filter((u) => { const v = +m![1] * U[u]; return v >= rg[1] && v <= rg[2]; });
        return ok.length === 1 && ok[0] === a ? null : `đơn vị thể tích: hợp lí ${ok.join("/")}, đáp án ${a}`;
      }
      if (/m³ nước/.test(q)) return want(N[0] * 1000, "m³ → lít");
      return want(N[0], "dm³ → lít");
    }
    case "khaiTrien": {
      if (/hình lập phương gồm/.test(q) || /hình hộp chữ nhật gồm/.test(q)) return want("6", "số mặt");
      if (/của hình trụ gồm/.test(q)) return want("2 hình tròn và 1 hình chữ nhật", "hình trụ");
      if (/hình trụ có bán kính đáy/.test(q)) return want(N[0] * 2 * 3.14, "chu vi đáy hình trụ");
      return want((N[0] + N[1]) * 2, "chu vi đáy hình hộp");
    }
    case "chiaThoiGian": {
      m = q.match(/^(\d+) (giờ|phút) (\d+) (phút|giây) : (\d+) = \?$/)!;
      const total = +m[1] * 60 + +m[3], k = +m[5];
      if (total % k) return "không chia hết";
      const t = total / k, val = (o: string) => { const x = o.match(/^(\d+) \S+ (\d+) \S+$/)!; return +x[1] * 60 + +x[2]; };
      if (opts.some((o) => +o.match(/ (\d+) \S+$/)![1] >= 60)) return "số phút / giây ≥ 60";
      if (opts.filter((o) => val(o) === t).length !== 1) return "nhiễu bằng giá trị đáp án";
      return val(a) === t ? null : `chia thời gian: ${t} ≠ ${a}`;
    }
    case "soLieu5": {
      const vals = q.match(/lần lượt là: ([\d; ]+)\./)![1].split("; ").map(Number), s = [...vals].sort((x, y) => x - y);
      if ((m = q.match(/số đứng thứ (\d+)/))) return want(s[+m[1] - 1], "sắp xếp số liệu");
      if (/cao hơn bạn thấp nhất/.test(q)) return want(s[s.length - 1] - s[0], "chênh lệch");
      m = q.match(/cao hơn (\d+) cm\.$/)!;
      return want(vals.filter((v) => v > +m![1]).length, "đếm số liệu");
    }
    case "tiSoLanLap": {
      const [t, s] = [N[N.length - 2], N[N.length - 1]];
      return want(`${s}/${t}`, "tỉ số số lần");
    }
    // Bài toán có lời văn: tính lại từ số liệu trong đề (số thập phân đọc kiểu Việt Nam).
    case "lvPhanSo": {
      m = q.match(/chứa ([\d.]+) lít nước\. .*dùng (\d+)\/(\d+) lượng .*dùng (\d+)\/(\d+) lượng/)!;
      const T = vn(m[1]), d1 = (T * +m[2]) / +m[3], d2 = (T * +m[4]) / +m[5];
      if (!Number.isInteger(d1) || !Number.isInteger(d2)) return "phần đã dùng không là số tự nhiên";
      return want(T - d1 - d2, "phân số của một số");
    }
    case "lvHecta": {
      m = q.match(/chiều dài ([\d.]+) m, chiều rộng ([\d.]+) m/)!;
      return want((vn(m[1]) * vn(m[2])) / 10000, "m² → ha");
    }
    case "lvCongSTP": {
      m = q.match(/cân nặng ([\d.,]+) kg, .* hơn bao thứ nhất ([\d.,]+) kg/)!;
      return want(2 * vn(m[1]) + vn(m[2]), "cộng số thập phân");
    }
    case "lvTruSTP": {
      m = q.match(/có ([\d.,]+) lít dầu\. .*lấy ra ([\d.,]+) lít, .*lấy ra ([\d.,]+) lít/)!;
      return want(vn(m[1]) - vn(m[2]) - vn(m[3]), "trừ số thập phân");
    }
    case "lvNhanSTP": {
      m = q.match(/cân nặng ([\d,]+) kg\. Một can rỗng cân nặng ([\d,]+) kg\. .*đựng (\d+) lít/)!;
      return want(vn(m[1]) * +m[3] + vn(m[2]), "nhân số thập phân");
    }
    case "lvChiaSTP": {
      m = q.match(/^Có ([\d.,]+) kg đường chia đều vào (\d+) túi\. Hỏi (\d+) túi/)!;
      return want((vn(m[1]) / +m[2]) * +m[3], "chia số thập phân");
    }
    case "lvTamGiac": {
      m = q.match(/đáy là (\d+) m, chiều cao bằng (\d+)\/(\d+) độ dài đáy/)!;
      const a2 = +m[1], h = (a2 * +m[2]) / +m[3];
      return Number.isInteger(h) ? want((a2 * h) / 2, "diện tích tam giác") : "chiều cao không là số tự nhiên";
    }
    case "lvHopKhongNap": {
      m = q.match(/chiều dài (\d+) dm, chiều rộng (\d+) dm, chiều cao (\d+) dm/)!;
      return want((+m[1] + +m[2]) * 2 * +m[3] + +m[1] * +m[2], "hộp không nắp");
    }
    case "lvLapPhuongSon":
      return want(5 * Number(q.match(/cạnh (\d+) dm/)![1]) ** 2, "thùng lập phương không nắp");
    case "lvLapPhuongGo": {
      m = q.match(/cạnh (\d+) dm\. Mỗi .* nặng ([\d,]+) kg/)!;
      return want(Number(m[1]) ** 3 * vn(m[2]), "khối gỗ lập phương");
    }
    case "lvThoiGian": case "lvVanToc": {
      const mins = (t: string) => { const x = t.match(/^(?:(\d+) giờ)? ?(?:(\d+) phút)?$/)!; return +(x[1] ?? 0) * 60 + +(x[2] ?? 0); };
      const [t1, t2] = [...q.matchAll(/lúc (\d+ giờ(?: \d+ phút)?)/g)].map((x) => mins(x[1]));
      if (name === "lvVanToc") return want(vn(q.match(/dài ([\d.,]+) km/)![1]) / ((t2 - t1) / 60), "vận tốc");
      const t = t2 - t1 - +q.match(/nghỉ (\d+) phút/)![1];
      if (opts.filter((o) => mins(o) === t).length !== 1) return "nhiễu bằng giá trị đáp án";
      return mins(a) === t ? null : `thời gian đi: ${t} phút ≠ ${a}`;
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
  ["KNTT4", KNTT4, recheck4],
  ["KNTT5", KNTT5, recheck5],
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
