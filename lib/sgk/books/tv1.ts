// lib/sgk/books/tv1.ts — Tiếng Việt 1, sách Kết nối tri thức với cuộc sống.
// Tập một: 83 bài học âm, vần (cứ bốn bài lại có một bài Ôn tập và kể chuyện), gom 5 bài
// một nhóm cho dễ xem. Tập hai: 8 chủ đề, mỗi chủ đề đánh số bài lại từ 1 và có bài Ôn tập,
// cuối tập ba bài Ôn tập. Tên bài theo mục lục (đối chiếu loigiaihay.com, vietjack.com,
// kế hoạch dạy học trên hoatieu.vn, 10/2026) — CẦN NGƯỜI SOÁT LẠI với sách in.
//
// Tập một chỉ hỏi bằng tiếng bé ĐÃ HỌC: mỗi bài ghi âm, vần, dấu thanh mới; `Known` cộng dồn
// tới bài đó và lib/tvGen/am.ts lọc kho tiếng theo đó. Bài 1, 2 (mới có a, b) là tập viết
// trên giấy. Tập hai: chính tả, tiếng cùng vần, từ ngữ theo chủ đề, điền từ, dấu câu.

import type { Generator } from "../../mathGen/core";
import { amDau, coAmVan, cungVan, dauThanh, ghepTieng, nhanChu, poolSize, TIENG_INFO, knows, type Known, type Tone } from "../../tvGen/am";
import { chinhTa } from "../../tvGen/spell";
import { chuHoa, dauCuoiCau, vonTu } from "../../tvGen/ltvc";
import { dienTu, type DIEN_TU } from "../../tvGen/lop1";
import type { SgkBook, SgkLesson, SgkTopic } from "../types";

type Mix = [Generator, number][];
type New = { o?: string[]; v?: string[]; t?: Tone[] };

/** Tập một: [tên bài, âm/vần/dấu mới]. Bài Ôn tập và kể chuyện ghi `null`. */
const TAP1: [string, New | null][] = [
  ["A a", { v: ["a"], t: [""] }],
  ["B b, dấu huyền", { o: ["b"], t: ["huyen"] }],
  ["C c, dấu sắc", { o: ["c"], t: ["sac"] }],
  ["E e, Ê ê", { v: ["e", "ê"] }],
  ["Ôn tập và kể chuyện", null],
  ["O o, dấu hỏi", { v: ["o"], t: ["hoi"] }],
  ["Ô ô, dấu nặng", { v: ["ô"], t: ["nang"] }],
  ["D d, Đ đ", { o: ["d", "đ"] }],
  ["Ơ ơ, dấu ngã", { v: ["ơ"], t: ["nga"] }],
  ["Ôn tập và kể chuyện", null],
  ["I i, K k", { v: ["i"], o: ["k"] }],
  ["H h, L l", { o: ["h", "l"] }],
  ["U u, Ư ư", { v: ["u", "ư"] }],
  ["Ch ch, Kh kh", { o: ["ch", "kh"] }],
  ["Ôn tập và kể chuyện", null],
  ["M m, N n", { o: ["m", "n"] }],
  ["G g, Gi gi", { o: ["g", "gi"] }],
  ["Gh gh, Nh nh", { o: ["gh", "nh"] }],
  ["Ng ng, Ngh ngh", { o: ["ng", "ngh"] }],
  ["Ôn tập và kể chuyện", null],
  ["R r, S s", { o: ["r", "s"] }],
  ["T t, Tr tr", { o: ["t", "tr"] }],
  ["Th th, ia", { o: ["th"], v: ["ia"] }],
  ["ua, ưa", { v: ["ua", "ưa"] }],
  ["Ôn tập và kể chuyện", null],
  ["Ph ph, Qu qu", { o: ["ph", "qu"] }],
  ["V v, X x", { o: ["v", "x"] }],
  ["Y y", { v: ["y", "uy"] }],
  ["Luyện tập chính tả", {}],
  ["Ôn tập và kể chuyện", null],
  ["an, ăn, ân", { v: ["an", "ăn", "ân"] }],
  ["on, ôn, ơn", { v: ["on", "ôn", "ơn"] }],
  ["en, ên, in, un", { v: ["en", "ên", "in", "un"] }],
  ["am, ăm, âm", { v: ["am", "ăm", "âm"] }],
  ["Ôn tập và kể chuyện", null],
  ["om, ôm, ơm", { v: ["om", "ôm", "ơm"] }],
  ["em, êm, im, um", { v: ["em", "êm", "im", "um"] }],
  ["ai, ay, ây", { v: ["ai", "ay", "ây"] }],
  ["oi, ôi, ơi", { v: ["oi", "ôi", "ơi"] }],
  ["Ôn tập và kể chuyện", null],
  ["ui, ưi", { v: ["ui", "ưi"] }],
  ["ao, eo", { v: ["ao", "eo"] }],
  ["au, âu, êu", { v: ["au", "âu", "êu"] }],
  ["iu, ưu", { v: ["iu", "ưu"] }],
  ["Ôn tập và kể chuyện", null],
  ["ac, ăc, âc", { v: ["ac", "ăc", "âc"] }],
  ["oc, ôc, uc, ưc", { v: ["oc", "ôc", "uc", "ưc"] }],
  ["at, ăt, ât", { v: ["at", "ăt", "ât"] }],
  ["ot, ôt, ơt", { v: ["ot", "ôt", "ơt"] }],
  ["Ôn tập và kể chuyện", null],
  ["et, êt, it", { v: ["et", "êt", "it"] }],
  ["ut, ưt", { v: ["ut", "ưt"] }],
  ["ap, ăp, âp", { v: ["ap", "ăp", "âp"] }],
  ["op, ôp, ơp", { v: ["op", "ôp", "ơp"] }],
  ["Ôn tập và kể chuyện", null],
  ["ep, êp, ip, up", { v: ["ep", "êp", "ip", "up"] }],
  ["anh, ênh, inh", { v: ["anh", "ênh", "inh"] }],
  ["ach, êch, ich", { v: ["ach", "êch", "ich"] }],
  ["ang, ăng, âng", { v: ["ang", "ăng", "âng"] }],
  ["Ôn tập và kể chuyện", null],
  ["ong, ông, ung, ưng", { v: ["ong", "ông", "ung", "ưng"] }],
  ["iêc, iên, iêp", { v: ["iêc", "iên", "iêp"] }],
  ["iêng, iêm, yên", { v: ["iêng", "iêm", "yên"] }],
  ["iêt, iêu, yêu", { v: ["iêt", "iêu", "yêu"] }],
  ["Ôn tập và kể chuyện", null],
  ["uôi, uôm", { v: ["uôi", "uôm"] }],
  ["uôc, uôt", { v: ["uôc", "uôt"] }],
  ["uôn, uông", { v: ["uôn", "uông"] }],
  ["ươi, ươu", { v: ["ươi", "ươu"] }],
  ["Ôn tập và kể chuyện", null],
  ["ươc, ươt", { v: ["ươc", "ươt"] }],
  ["ươm, ươp", { v: ["ươm", "ươp"] }],
  ["ươn, ương", { v: ["ươn", "ương"] }],
  ["oa, oe", { v: ["oa", "oe"] }],
  ["Ôn tập và kể chuyện", null],
  ["oan, oăn, oat, oăt", { v: ["oan", "oăn", "oat", "oăt"] }],
  ["oai, uê, uy", { v: ["oai", "uê"] }],
  ["uân, uât", { v: ["uân", "uât"] }],
  ["uyên, uyêt", { v: ["uyên", "uyêt"] }],
  ["Ôn tập và kể chuyện", null],
  ["Ôn tập", null],
  ["Ôn tập", null],
  ["Ôn tập", null],
];

/** Chữ cái của âm / vần mới (để bé nhận mặt chữ). */
const lettersOf = (n: New) => [...new Set([...(n.o ?? []), ...(n.v ?? [])].filter((x) => x.length === 1))];

function tap1Lessons(): SgkLesson[] {
  const k: Known = { onsets: new Set(), rhymes: new Set(), tones: new Set() };
  const out: SgkLesson[] = [];
  TAP1.forEach(([ten, n], i) => {
    const so = i + 1;
    if (n) {
      n.o?.forEach((x) => k.onsets.add(x));
      n.v?.forEach((x) => k.rhymes.add(x));
      n.t?.forEach((x) => k.tones.add(x));
    }
    const snap: Known = { onsets: new Set(k.onsets), rhymes: new Set(k.rhymes), tones: new Set(k.tones) };
    if (!n) {
      // Ôn tập: trộn các bài học trước đó (81: vần bài 31–55, 82: vần bài 56–79, 83: mọi bài).
      const tron = so === 81 ? range(31, 54) : so === 82 ? range(56, 79) : so === 83 ? range(3, 79) : range(so - 4, so - 1);
      out.push({ so, soTap: so, ten, luyen: true, tron });
      return;
    }
    if (so <= 2) { out.push({ so, soTap: so, ten, thucHanh: true }); return; }
    if (so === 29) {
      out.push({ so, soTap: so, ten, mix: [[chinhTa("c-k"), 4], [chinhTa("g-gh"), 3], [chinhTa("ng-ngh"), 3]] });
      return;
    }
    out.push({ so, soTap: so, ten, mix: tap1Mix(n, snap) });
  });
  return out;
}

/**
 * Chia 10 câu cho các dạng theo mong muốn, nhưng không quá số câu khác nhau mỗi dạng ra được
 * (bài đầu mới có vài tiếng): phần dư dồn cho dạng còn nhiều chỗ nhất.
 */
function fit(parts: [Generator, number, number][]): Mix {
  const want = parts.map(([, w, cap]) => Math.min(w, cap));
  let left = 10 - want.reduce((a, b) => a + b, 0);
  while (left > 0) {
    let best = -1;
    parts.forEach(([, , cap], i) => { if (want[i] < cap && (best < 0 || cap - want[i] > parts[best][2] - want[best])) best = i; });
    if (best < 0) break;
    want[best]++; left--;
  }
  return parts.map(([g], i) => [g, want[i]] as [Generator, number]).filter(([, n]) => n > 0);
}

function tap1Mix(n: New, k: Known): Mix {
  const letters = lettersOf(n);
  const vanMoi = (n.v ?? []).filter((v) => TIENG_INFO.some((t) => t.rhyme === v && knows(k, t)));
  const dau: [Generator, number, number][] = [...k.tones].length >= 2 ? [[dauThanh(k), 2, poolSize.dauThanh(k)]] : [];
  if (n.o?.length) {
    // Bài âm đầu: nhận chữ, tiếng bắt đầu bằng chữ nào, tiếng nào có âm, ghép tiếng, dấu thanh.
    return fit([
      [nhanChu(letters), 2, letters.length],
      [amDau(n.o, k), 3, poolSize.amDau(n.o, k)],
      [coAmVan("am", n.o, k), 2, poolSize.coAmVan("am", n.o, k)],
      [ghepTieng(k), 2, poolSize.ghep(k)],
      ...dau,
    ]);
  }
  if ((n.v ?? []).every((v) => v.length === 1)) {
    // Bài nguyên âm (e, ê, o, ô, ơ, u, ư…): nhận chữ, tiếng nào có vần, ghép tiếng, dấu thanh.
    return fit([
      [nhanChu(letters), 2, letters.length],
      [coAmVan("van", vanMoi, k), 3, poolSize.coAmVan("van", vanMoi, k)],
      [ghepTieng(k, vanMoi), 2, poolSize.ghep(k, vanMoi)],
      ...dau,
    ]);
  }
  // Bài vần: tiếng nào có vần (dễ lẫn với vần cùng bài), ghép tiếng, dấu thanh — đều với tiếng có vần mới.
  const ghepDuoc = vanMoi.filter((v) => poolSize.ghep(k, [v]) > 0);
  return fit([
    [coAmVan("van", vanMoi, k), 5, poolSize.coAmVan("van", vanMoi, k)],
    ...(ghepDuoc.length ? [[ghepTieng(k, ghepDuoc), 3, poolSize.ghep(k, ghepDuoc)] as [Generator, number, number]] : []),
    [dauThanh(k, vanMoi), 2, poolSize.dauThanh(k, vanMoi)],
  ]);
}

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i).filter((x) => TAP1[x - 1]?.[1]);

/* ───────────── Tập hai ───────────── */

const CHU_DE: { ten: string; bai: string[]; theme: string; dien: keyof typeof DIEN_TU; spell: [string, string] }[] = [
  { ten: "Tôi và các bạn", bai: ["Tôi là học sinh lớp 1", "Đôi tai xấu xí", "Bạn của gió", "Giải thưởng tình bạn", "Sinh nhật của voi con"], theme: "tinh-cam-ban-be", dien: "ban-be", spell: ["c-k", "g-gh"] },
  { ten: "Mái ấm gia đình", bai: ["Nụ hôn trên bàn tay", "Làm anh", "Cả nhà đi chơi núi", "Quạt cho bà ngủ", "Bữa cơm gia đình", "Ngôi nhà"], theme: "gia-dinh", dien: "gia-dinh", spell: ["ng-ngh", "ch-tr"] },
  { ten: "Mái trường mến yêu", bai: ["Tôi đi học", "Đi học", "Hoa yêu thương", "Cây bàng và lớp học", "Bác trống trường", "Giờ ra chơi"], theme: "truong-hoc", dien: "truong-hoc", spell: ["s-x", "l-n"] },
  { ten: "Điều em cần biết", bai: ["Rửa tay trước khi ăn", "Lời chào đi trước", "Khi mẹ vắng nhà", "Nếu không may bị lạc", "Đèn giao thông"], theme: "an-toan", dien: "an-toan", spell: ["v-d-gi", "c-k"] },
  { ten: "Bài học từ cuộc sống", bai: ["Kiến và chim bồ câu", "Câu chuyện của rễ", "Câu hỏi của sói", "Chú bé chăn cừu", "Tiếng vọng của núi"], theme: "duc-tinh", dien: "bai-hoc", spell: ["h-th-kh", "g-gh"] },
  { ten: "Thiên nhiên kì thú", bai: ["Loài chim của biển cả", "Bảy sắc cầu vồng", "Chúa tể rừng xanh", "Cuộc thi tài năng rừng xanh", "Cây liễu dẻo dai"], theme: "thien-nhien", dien: "thien-nhien", spell: ["r-d-gi", "ng-ngh"] },
  { ten: "Thế giới trong mắt em", bai: ["Tia nắng đi đâu?", "Trong giấc mơ buổi sáng", "Ngày mới bắt đầu", "Hỏi mẹ", "Những cánh cò", "Buổi trưa hè", "Hoa phượng"], theme: "am-thanh", dien: "canh-vat", spell: ["ch-tr", "s-x"] },
  { ten: "Đất nước và con người", bai: ["Cậu bé thông minh", "Lính cứu hỏa", "Lớn lên bạn làm gì?", "Ruộng bậc thang ở Sa Pa", "Nhớ ơn", "Du lịch biển Việt Nam"], theme: "nghe-nghiep", dien: "dat-nuoc", spell: ["l-n", "ao-au"] },
];

/** Tập hai: bé đã học hết âm, vần của tập một. */
const ALL: Known = {
  onsets: new Set(TIENG_INFO.map((t) => t.onset).filter(Boolean)),
  rhymes: new Set(TIENG_INFO.map((t) => t.rhyme)),
  tones: new Set(["", "huyen", "sac", "hoi", "nga", "nang"] as Tone[]),
};
const cungVanAll = cungVan(ALL);
const viethoa = chuHoa(["A", "B", "C", "Đ", "E", "H", "L", "M", "N", "Q", "S", "T", "V"]);
const cham = dauCuoiCau([".", "?"]);

function tap2Topics(firstSo: number, firstTopic: number): SgkTopic[] {
  let so = firstSo;
  const topics: SgkTopic[] = CHU_DE.map((c, i) => {
    const lessons: SgkLesson[] = c.bai.map((ten, j) => ({
      so: so++, soTap: j + 1, ten,
      mix: [
        [chinhTa(c.spell[0]), 2], [chinhTa(c.spell[1]), 1], [cungVanAll, 2],
        [vonTu(c.theme as Parameters<typeof vonTu>[0]), 2], [dienTu(c.dien), 2], [j % 2 ? viethoa : cham, 1],
      ],
    }));
    const tron = lessons.map((l) => l.so);
    lessons.push({ so: so++, nhan: "Ôn tập", ten: `Ôn tập chủ đề ${c.ten}`, luyen: true, tron });
    return { so: firstTopic + i, tap: 2 as const, ten: c.ten, bai: lessons };
  });
  const all = topics.flatMap((t) => t.bai.filter((l) => !l.luyen).map((l) => l.so));
  topics.push({
    so: firstTopic + CHU_DE.length, tap: 2, ten: "Ôn tập và đánh giá cuối năm",
    bai: [1, 2, 3].map((n) => ({ so: so++, soTap: n, ten: "Ôn tập", luyen: true as const, tron: all })),
  });
  return topics;
}

/* ───────────── Ghép sách ───────────── */

const tap1 = tap1Lessons();
const GROUPS: [string, number, number][] = [
  ["Âm a, b, c, e, ê", 1, 5], ["Âm o, ô, d, đ, ơ", 6, 10], ["Âm i, k, h, l, u, ư, ch, kh", 11, 15], ["Âm m, n, g, gi, gh, nh, ng, ngh", 16, 20],
  ["Âm r, s, t, tr, th; vần ia, ua, ưa", 21, 25], ["Âm ph, qu, v, x, y", 26, 30], ["Vần an, on, en, am…", 31, 35], ["Vần om, em, ai, oi…", 36, 40],
  ["Vần ui, ao, au, iu…", 41, 45], ["Vần ac, oc, at, ot…", 46, 50], ["Vần et, ut, ap, op…", 51, 55], ["Vần ep, anh, ach, ang…", 56, 60],
  ["Vần ong, iêc, iêng, iêt…", 61, 65], ["Vần uôi, uôc, uôn, ươi…", 66, 70], ["Vần ươc, ươm, ươn, oa…", 71, 75], ["Vần oan, oai, uân, uyên…", 76, 80],
  ["Ôn tập cuối học kì 1", 81, 83],
];
const topics: SgkTopic[] = [
  ...GROUPS.map(([ten, a, b], i) => ({ so: i + 1, tap: 1 as const, ten, bai: tap1.filter((l) => l.so >= a && l.so <= b) })),
  ...tap2Topics(tap1.length + 1, GROUPS.length + 1),
];

export const TV1: SgkBook = {
  id: "kntt-tv-1",
  subject: "Tiếng Việt",
  slug: "tieng-viet",
  grade: 1,
  book: "Kết nối tri thức với cuộc sống",
  source: "Mục lục Tiếng Việt 1 tập một, tập hai đối chiếu trên loigiaihay.com, vietjack.com và kế hoạch dạy học (10/2026)",
  topicLabel: "Chủ đề",
  topics,
};

/** Mọi âm đầu, vần dạy ở tập một (cho scripts/sgk-tv-check.ts soát kho tiếng). */
export const TV1_TAUGHT = {
  onsets: new Set(TAP1.flatMap(([, n]) => n?.o ?? [])),
  rhymes: new Set(TAP1.flatMap(([, n]) => n?.v ?? [])),
};
