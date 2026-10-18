// Trò chơi lớp 5 — sinh câu hỏi ngẫu nhiên trên trình duyệt, bám chương trình lớp 5
// (SGK mới): số thập phân (so sánh, hàng, viết phân số thập phân), tỉ số phần trăm,
// kết từ (và, nhưng, vì… nên…, nếu… thì…).
//
// Số thập phân tính bằng số nguyên (phần nghìn), không dùng float — 0,1 + 0,2 không
// bao giờ thành 0,30000000000000004. Kiểm tra: scripts/games-extra-check.ts.

import { pick, shuffle } from "./games";
import { fmtInt, type CompareSign, SIGN_WORDS } from "./games4";

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

/* ═════════════ Số thập phân ═════════════ */

/** Một số thập phân: `units` phần nghìn, hiển thị đúng `places` chữ số sau dấu phẩy. */
export type Decimal = { units: number; places: 0 | 1 | 2 | 3 };

/** "2,450" giữ nguyên số chữ số thập phân đã chọn (0,7 và 0,70 khác cách viết). */
export function decText(x: Decimal): string {
  const int = Math.floor(x.units / 1000);
  const frac = String(x.units % 1000).padStart(3, "0").slice(0, x.places);
  return x.places ? `${fmtInt(int)},${frac}` : fmtInt(int);
}

/** Số thập phân có đúng `places` chữ số sau dấu phẩy (chữ số cuối khác 0 khi places > 0). */
function randDecimal(maxInt: number, places: 1 | 2 | 3): Decimal {
  const step = 10 ** (3 - places);
  let units: number;
  do {
    units = randInt(0, maxInt) * 1000 + randInt(0, 10 ** places - 1) * step;
  } while (units === 0 || (units / step) % 10 === 0);
  return { units, places };
}

export type DecimalLevel = "so-sanh" | "hang" | "phan-so";

export const PLACE_NAMES = ["hàng chục", "hàng đơn vị", "hàng phần mười", "hàng phần trăm", "hàng phần nghìn"] as const;

export type DecimalQuestion =
  | { kind: "so-sanh"; a: string; b: string; answer: CompareSign; reveal: string }
  | { kind: "hang"; number: string; digit: number; answer: string; options: string[]; reveal: string }
  | { kind: "phan-so"; n: number; d: number; answer: string; options: string[]; reveal: string };

export function makeDecimalQuestion(level: DecimalLevel): DecimalQuestion {
  if (level === "so-sanh") {
    let a: Decimal, b: Decimal;
    const trap = pick(["them-so-0", "nhieu-chu-so", "ngau-nhien"] as const);
    if (trap === "them-so-0") {
      // 0,7 và 0,70: viết thêm chữ số 0 ở cuối phần thập phân thì giá trị không đổi.
      a = randDecimal(20, 1);
      b = { units: a.units, places: 2 };
    } else if (trap === "nhieu-chu-so") {
      // 2,5 và 2,45: số nhiều chữ số hơn chưa chắc lớn hơn.
      a = randDecimal(20, 1);
      b = { units: Math.floor(a.units / 1000) * 1000 + randInt(1, 99) * 10, places: 2 };
      if (b.units % 100 === 0) b = { units: b.units + 10, places: 2 };
    } else {
      a = randDecimal(20, pick([1, 2] as const));
      b = randDecimal(20, pick([1, 2] as const));
    }
    if (Math.random() < 0.5) [a, b] = [b, a];
    const answer: CompareSign = a.units > b.units ? ">" : a.units < b.units ? "<" : "=";
    return { kind: "so-sanh", a: decText(a), b: decText(b), answer, reveal: `${decText(a)} ${SIGN_WORDS[answer]} ${decText(b)}` };
  }
  if (level === "hang") {
    // Năm chữ số khác nhau, khác 0: chục, đơn vị, phần mười, phần trăm, phần nghìn — mỗi chữ số chỉ ở một hàng.
    const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 5);
    const number = `${digits[0]}${digits[1]},${digits[2]}${digits[3]}${digits[4]}`;
    const at = randInt(0, 4);
    const answer = PLACE_NAMES[at];
    const others = shuffle(PLACE_NAMES.filter((p) => p !== answer)).slice(0, 3);
    const options = PLACE_NAMES.filter((p) => p === answer || others.includes(p));
    return { kind: "hang", number, digit: digits[at], answer, options: [...options], reveal: `Chữ số ${digits[at]} thuộc ${answer}` };
  }
  // Phân số thập phân → số thập phân: 7/10 = 0,7; 25/100 = 0,25; 3/1000 = 0,003.
  const places = pick([1, 2, 3] as const);
  const d = 10 ** places;
  let n: number;
  // Tử số nhỏ: 7/10, 13/10, 25/100, 7/1000 — 7/100 và 7/1000 là chỗ hay nhầm số chữ số 0.
  do n = randInt(1, places === 1 ? 29 : 99);
  while (n % 10 === 0);
  const base = n * 10 ** (3 - places);
  const answer = decText({ units: base, places });
  // Nhiễu: dấu phẩy lệch một, hai hàng (nhân / chia nhầm 10, 100), hoặc quên dấu phẩy.
  const cands: string[] = [String(n)];
  for (const k of [1, 2, -1, -2]) {
    const np = places - k;
    const units = k > 0 ? base * 10 ** k : base / 10 ** -k;
    if (np >= 0 && np <= 3 && Number.isInteger(units)) cands.push(decText({ units, places: np as Decimal["places"] }));
  }
  const options = [answer];
  for (const c of shuffle(cands)) if (options.length < 4 && !options.includes(c)) options.push(c);
  return { kind: "phan-so", n, d, answer, options: shuffle(options), reveal: `${n} phần ${fmtInt(d)} bằng ${answer}` };
}

/* ═════════════ Tỉ số phần trăm ═════════════ */

export type PercentLevel = "tim-gia-tri" | "ti-so";

export type PercentQuestion = { text: string; answer: string; options: string[]; reveal: string };

const PERCENTS = [5, 10, 20, 25, 40, 50, 60, 75, 80] as const;

/** Số `b` để `p`% của `b` là số tự nhiên, không quá `max`. */
function baseFor(p: number, max: number): number {
  const step = 100 / gcd100(p);
  return step * randInt(1, Math.floor(max / step));
}
const gcd100 = (p: number) => {
  let a = p, b = 100;
  while (b) [a, b] = [b, a % b];
  return a;
};

export function makePercentQuestion(level: PercentLevel): PercentQuestion {
  const p = pick(PERCENTS);
  if (level === "tim-gia-tri") {
    const b = baseFor(p, 400);
    const a = (b * p) / 100;
    // Nhiễu: chia cho p, lấy phần còn lại, nhầm một bậc mười.
    const cands = [b - a, a * 10, a + 10, Math.max(1, a - 5), b / 10, p];
    const options = withNumbers(a, cands).map(String);
    return { text: `${p}% của ${b} là bao nhiêu?`, answer: String(a), options, reveal: `${p} phần trăm của ${b} là ${a}` };
  }
  const thing = pick(SITUATIONS);
  const b = baseFor(p, thing.max);
  const a = (b * p) / 100;
  const cands = [100 - p, p / 10, p + 5, p - 5, p + 10, p * 2].filter((x) => x > 0 && x < 100 && Number.isInteger(x));
  const options = withNumbers(p, cands).map((x) => `${x}%`);
  return {
    text: thing.text(a, b),
    answer: `${p}%`,
    options,
    reveal: `${a} là ${p} phần trăm của ${b}`,
  };
}

/** Tình huống "a là bao nhiêu phần trăm của b"; `max` giữ số cho hợp thực tế (lớp học không có 400 bạn). */
const SITUATIONS: { max: number; text: (a: number, b: number) => string }[] = [
  { max: 40, text: (a, b) => `Lớp 5A có ${b} bạn, trong đó ${a} bạn thích bơi. Số bạn thích bơi chiếm bao nhiêu phần trăm số bạn cả lớp?` },
  { max: 400, text: (a, b) => `Một vườn có ${b} cây, trong đó có ${a} cây cam. Số cây cam chiếm bao nhiêu phần trăm số cây trong vườn?` },
  { max: 400, text: (a, b) => `Thư viện có ${b} quyển sách, trong đó có ${a} quyển truyện tranh. Truyện tranh chiếm bao nhiêu phần trăm số sách?` },
  { max: 200, text: (a, b) => `Một trang trại nuôi ${b} con gà, trong đó có ${a} con gà trống. Gà trống chiếm bao nhiêu phần trăm số gà?` },
  { max: 400, text: (a, b) => `Trường em có ${b} học sinh, trong đó ${a} học sinh đi học bằng xe đạp. Số học sinh đi xe đạp chiếm bao nhiêu phần trăm?` },
];

function withNumbers(answer: number, cands: number[]): number[] {
  const out = [answer];
  for (const c of shuffle(cands)) if (out.length < 4 && Number.isInteger(c) && c > 0 && !out.includes(c)) out.push(c);
  for (let d = 1; out.length < 4; d++) if (!out.includes(answer + d)) out.push(answer + d);
  return out.sort((x, y) => x - y);
}

/* ═════════════ Kết từ ═════════════ */

export type ConnectiveItem = { text: string; answer: string; options: string[] };

// Mỗi câu chỉ một kết từ đúng trong các lựa chọn: lựa chọn nhiễu phải sai rõ ràng
// (sai nghĩa hoặc sai cặp "vì… nên", "nếu… thì", "tuy… nhưng", "không chỉ… mà còn").
// "___" là chỗ trống, đúng một lần mỗi câu.
export const CONNECTIVES: ConnectiveItem[] = [
  { text: "Bạn Lan học giỏi ___ hát rất hay.", answer: "và", options: ["và", "nhưng", "nên", "vì"] },
  { text: "Vì trời mưa to ___ trận đấu bị hoãn.", answer: "nên", options: ["nên", "nhưng", "thì", "hay"] },
  { text: "___ em chăm chỉ luyện tập nên em đạt giải nhất.", answer: "Vì", options: ["Vì", "Nếu", "Tuy", "Hay"] },
  { text: "Nếu ngày mai trời nắng ___ cả lớp sẽ đi cắm trại.", answer: "thì", options: ["thì", "nên", "nhưng", "và"] },
  { text: "Tuy nhà xa ___ bạn Minh chưa bao giờ đi học muộn.", answer: "nhưng", options: ["nhưng", "nên", "thì", "và"] },
  { text: "Con muốn uống sữa ___ nước cam?", answer: "hay", options: ["hay", "nhưng", "nên", "vì"] },
  { text: "Em rất muốn đi chơi ___ phải ở nhà ôn bài.", answer: "nhưng", options: ["nhưng", "nên", "thì", "vì"] },
  { text: "Mẹ mua cho em một quyển truyện ___ một hộp bút màu.", answer: "và", options: ["và", "nhưng", "nên", "thì"] },
  { text: "Em làm bài cẩn thận ___ được cô khen.", answer: "nên", options: ["nên", "nhưng", "hay", "tuy"] },
  { text: "Hoa không chỉ học giỏi ___ còn rất chăm làm việc nhà.", answer: "mà", options: ["mà", "nên", "thì", "vì"] },
  { text: "Chúng em đi tham quan ___ ô tô.", answer: "bằng", options: ["bằng", "của", "để", "nhưng"] },
  { text: "Quyển sách ___ Nam bị bỏ quên trên bàn.", answer: "của", options: ["của", "bằng", "để", "nhưng"] },
  { text: "Em đến thư viện ___ mượn sách.", answer: "để", options: ["để", "của", "nhưng", "hay"] },
  { text: "Hễ trời mưa ___ đường làng lại lầy lội.", answer: "là", options: ["là", "nhưng", "hay", "vì"] },
  { text: "Mặc dù đã rất cố gắng ___ đội em vẫn thua sát nút.", answer: "nhưng", options: ["nhưng", "nên", "thì", "và"] },
  { text: "Chẳng những Nam chăm học ___ Nam còn chăm làm.", answer: "mà", options: ["mà", "nên", "thì", "hay"] },
  { text: "Do mải chơi ___ em quên làm bài tập.", answer: "nên", options: ["nên", "nhưng", "thì", "hay"] },
  { text: "Nhờ bạn bè giúp đỡ ___ Hùng đã tiến bộ nhanh.", answer: "mà", options: ["mà", "nhưng", "hay", "tuy"] },
  { text: "Bạn thích đọc truyện cổ tích ___ truyện khoa học?", answer: "hay", options: ["hay", "nên", "vì", "nhưng"] },
  { text: "Giá mà hôm nay không mưa ___ chúng mình đã được ra sân chơi.", answer: "thì", options: ["thì", "nhưng", "và", "vì"] },
];

/** Câu đã điền kết từ đúng, để đọc lại sau lời khen. */
export const fillConnective = (q: ConnectiveItem) => q.text.replace("___", q.answer);

/** `avoid`: câu vừa hỏi (đã điền), để không hỏi lại liền. */
export function makeConnectiveQuestion(avoid?: string): ConnectiveItem {
  let q: ConnectiveItem;
  do q = pick(CONNECTIVES);
  while (fillConnective(q) === avoid);
  return { ...q, options: shuffle(q.options) };
}
