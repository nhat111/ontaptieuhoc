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

import { mulberry32, type Draft } from "../lib/mathGen/core";
import { KNTT3 } from "../lib/mathGen";
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

// Mỗi bộ dạng câu KNTT<N> đi kèm hàm tính lại của nó. Dạng số học thuần (phép tính, so
// sánh, liền trước – liền sau) đã được scripts/gen-math-check.ts tính lại nên trả null ở đây.
const RECHECK: [string, Record<string, (r: ReturnType<typeof mulberry32>) => Draft>, (name: string, d: Draft) => string | null][] = [
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
