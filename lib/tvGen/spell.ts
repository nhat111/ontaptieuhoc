// lib/tvGen/spell.ts — chính tả: chọn âm đầu, vần hoặc dấu thanh điền vào chỗ trống.
// Âm đầu và các vần ao/au, ai/ay, an/ang dùng lại kho từ đã soát của phiếu luyện hằng ngày
// (lib/dailySheet.ts). Các vần khác của Tiếng Việt 2 soạn tay ở đây, cùng cách ghi:
// phần trong [ ] là chỗ trống; vần ghi kèm dấu thanh ("con c[ừu]"), câu hỏi bỏ dấu thanh
// để bé chọn vần ("iu hay ưu"). scripts/sgk-tv-check.ts soát luật c/k, g/gh, ng/ngh và
// vần của từng từ. CẦN NGƯỜI DUYỆT các từ mới.

import { pick } from "../mathGen/core";
import { SPELL_GROUPS, SPELL_GROUPS_2 } from "../dailySheet";
import { mcFixed, stripTone, type Generator } from "./core";

export type SpellBank = { id: string; options: string[]; words: string[]; part?: "van" };

/** Vần dễ lẫn trong phần Nghe – viết của Tiếng Việt 2 (ngoài ao/au, ai/ay, an/ang). */
const RHYMES: SpellBank[] = [
  { id: "iu-uu", options: ["iu", "ưu"], part: "van", words: [
    "cái r[ìu]", "nhỏ x[íu]", "l[íu] lo", "d[ịu] dàng", "tr[ĩu] quả", "b[ĩu] môi", "ch[ịu] khó",
    "con c[ừu]", "b[ưu] điện", "c[ứu] người", "về h[ưu]", "s[ưu] tầm", "t[ựu] trường", "cấp c[ứu]",
  ] },
  { id: "ieu-uou", options: ["iêu", "ươu"], part: "van", words: [
    "cánh d[iều]", "buổi ch[iều]", "cái n[iêu]", "h[iểu] bài", "hạt t[iêu]", "tờ ph[iếu]", "h[iếu] thảo", "ít nh[iều]",
    "con h[ươu]", "chim kh[ướu]", "ốc b[ươu]", "h[ươu] sao", "b[ướu] lạc đà",
  ] },
  { id: "en-eng", options: ["en", "eng"], part: "van", words: [
    "cái k[èn]", "hoa s[en]", "đ[èn] học", "áo l[en]", "kh[en] ngợi", "ngọn đ[èn]",
    "cái x[ẻng]", "đánh k[ẻng]", "l[eng] keng", "xà b[eng]",
  ] },
  { id: "ien-ieng", options: ["iên", "iêng"], part: "van", words: [
    "cô t[iên]", "b[iển] xanh", "con k[iến]", "v[iên] phấn", "đ[iện] thoại", "h[iền] lành",
    "t[iếng] hát", "s[iêng] năng", "củ r[iềng]", "ch[iêng] trống", "kh[iêng] bàn", "cái k[iềng]",
  ] },
  { id: "uon-uong", options: ["uôn", "uông"], part: "van", words: [
    "b[uồn] ngủ", "c[uộn] len", "m[uôn] màu", "l[uôn] luôn", "kh[uôn] mặt", "b[uôn] bán",
    "cái ch[uông]", "r[uộng] lúa", "x[uống] dốc", "b[uồng] chuối", "l[uống] rau", "c[uống] lá",
  ] },
  { id: "ac-at", options: ["ac", "at"], part: "van", words: [
    "b[ác] sĩ", "con h[ạc]", "c[ác] bạn", "th[ác] nước", "âm nh[ạc]",
    "ca h[át]", "bãi c[át]", "m[át] mẻ", "h[ạt] gạo", "kh[át] nước",
  ] },
  { id: "ac-at-2", options: ["ăc", "ăt"], part: "van", words: [
    "s[ắc] màu", "m[ắc] áo", "đ[ặc] biệt", "ăn m[ặc]", "phương b[ắc]",
    "m[ặt] trời", "c[ắt] cỏ", "b[ắt] tay", "ch[ặt] cây", "th[ắt] lưng",
  ] },
  { id: "ac-at-3", options: ["âc", "ât"], part: "van", words: [
    "b[ậc] thang", "nh[ấc] chân", "quả g[ấc]", "xôi g[ấc]", "nh[ấc] máy",
    "đ[ất] nước", "th[ật] thà", "m[ật] ong", "v[ật] nuôi", "b[ật] đèn",
  ] },
  { id: "uc-ut", options: ["uc", "ut"], part: "van", words: [
    "hoa c[úc]", "b[ục] giảng", "x[úc] cát", "ch[úc] mừng", "l[úc] ấy",
    "b[út] chì", "s[út] bóng", "r[út] thăm", "h[út] bụi", "ng[út] ngàn",
  ] },
  { id: "iet-iec", options: ["iêt", "iêc"], part: "van", words: [
    "v[iết] bài", "b[iết] ơn", "t[iết] học", "m[iệt] mài",
    "ch[iếc] lá", "rạp x[iếc]", "t[iệc] sinh nhật", "v[iệc] nhà",
  ] },
  { id: "uynh-uych", options: ["uynh", "uych"], part: "van", words: [
    "phụ h[uynh]", "kh[uỳnh] tay", "hoa q[uỳnh]", "l[uýnh] quýnh",
    "h[uých] tay", "h[uých] vai", "ngã đánh h[uỵch]",
  ] },
  { id: "uya-uyu", options: ["uya", "uyu"], part: "van", words: [
    "đêm kh[uya]", "kh[uya] lắm rồi", "giấy pơ-l[uya]",
    "kh[uỷu] tay", "đường khúc kh[uỷu]", "ngã kh[uỵu]",
  ] },
  { id: "uoc-uot", options: ["ươc", "ươt"], part: "van", words: [
    "b[ước] đi", "th[ước] kẻ", "n[ước] mắt", "đ[ược] khen",
    "m[ượt] mà", "l[ướt] sóng", "v[ượt] qua", "tr[ượt] chân",
  ] },
  { id: "et-ech", options: ["êt", "êch"], part: "van", words: [
    "t[ết] tóc", "m[ệt] mỏi", "h[ết] giờ", "k[ết] bạn", "d[ệt] vải",
    "con [ếch]", "méo x[ệch]", "chênh l[ệch]", "đội mũ l[ệch]",
  ] },
  { id: "oanh-oach", options: ["oanh", "oach"], part: "van", words: [
    "kh[oanh] tay", "d[oanh] trại", "mới t[oanh]", "l[oanh] quanh",
    "kế h[oạch]", "thu h[oạch]", "kêu l[oạch] xoạch",
  ] },
  { id: "eo-oe", options: ["eo", "oe"], part: "van", words: [
    "con m[èo]", "cái k[éo]", "b[éo] tròn", "tr[èo] cây", "l[eo] núi",
    "kh[oẻ] mạnh", "chích ch[oè]", "đỏ h[oe]", "x[oè] cánh",
  ] },
  { id: "en-enh", options: ["ên", "ênh"], part: "van", words: [
    "b[ên] cạnh", "con nh[ện]", "đ[ến] trường", "ngọn n[ến]",
    "b[ệnh] viện", "dòng k[ênh]", "m[ênh] mông", "l[ênh] đênh",
  ] },
  { id: "ip-iep", options: ["ip", "iêp"], part: "van", words: [
    "theo k[ịp]", "nh[ịp] cầu", "d[ịp] Tết", "chim bìm b[ịp]",
    "t[iếp] theo", "rau d[iếp]", "tấm th[iếp]", "h[iệp] sĩ",
  ] },
  { id: "im-iem", options: ["im", "iêm"], part: "van", words: [
    "con ch[im]", "trái t[im]", "k[im] chỉ", "m[ỉm] cười",
    "t[iêm] phòng", "k[iểm] tra", "n[iềm] vui", "đ[iểm] mười",
  ] },
  { id: "it-uyt", options: ["it", "uyt"], part: "van", words: [
    "quả m[ít]", "con v[ịt]", "h[ít] thở", "th[ịt] gà",
    "xe b[uýt]", "s[uýt] ngã", "h[uýt] sáo", "s[uýt] nữa",
  ] },
  { id: "in-inh", options: ["in", "inh"], part: "van", words: [
    "x[in] lỗi", "t[in] tức", "số ch[ín]", "đèn p[in]", "nh[ìn] xa",
    "x[inh] đẹp", "t[ình] bạn", "h[ình] tròn", "k[ính] lúp", "b[ình] hoa",
  ] },
  { id: "uon-uong-2", options: ["ươn", "ương"], part: "van", words: [
    "s[ườn] núi", "v[ươn] vai", "v[ườn] rau", "bay l[ượn]", "con l[ươn]",
    "con đ[ường]", "hạt s[ương]", "cái g[ương]", "hoa h[ướng] dương", "yêu th[ương]", "hoa ph[ượng]",
  ] },
  { id: "uoc-uot-2", options: ["uôc", "uôt"], part: "van", words: [
    "chim c[uốc]", "c[uộc] thi", "viên th[uốc]", "b[uộc] dây", "ngọn đ[uốc]",
    "con ch[uột]", "lạnh b[uốt]", "r[uột] bút", "s[uốt] ngày", "v[uốt] ve",
  ] },
  { id: "iu-ieu", options: ["iu", "iêu"], part: "van", words: [
    "cái r[ìu]", "nhỏ x[íu]", "l[íu] lo", "d[ịu] dàng", "ch[ịu] khó",
    "cánh d[iều]", "buổi ch[iều]", "hạt t[iêu]", "h[iểu] bài", "tờ ph[iếu]",
  ] },
  { id: "ien-yen-uyen", options: ["iên", "yên", "uyên"], part: "van", words: [
    "cô t[iên]", "b[iển] xanh", "v[iên] phấn",
    "[yên] lặng", "bình [yên]", "chim [yến]",
    "con th[uyền]", "ch[uyện] cổ tích", "lời kh[uyên]",
  ] },
];

/** Mọi kho chính tả theo id (âm đầu: "c-k", "ch-tr", …; vần: "iu-uu", …). */
export const SPELL_BANKS: SpellBank[] = [...SPELL_GROUPS, ...SPELL_GROUPS_2, ...RHYMES];

const bank = (id: string) => {
  const b = SPELL_BANKS.find((x) => x.id === id);
  if (!b) throw new Error(`Không có kho chính tả ${id}`);
  return b;
};

const HINT: Record<string, string> = {
  c: "Viết k trước e, ê, i; viết c trước các âm còn lại.",
  k: "Viết k trước e, ê, i; viết c trước các âm còn lại.",
  g: "Viết gh trước e, ê, i; viết g trước các âm còn lại.",
  gh: "Viết gh trước e, ê, i; viết g trước các âm còn lại.",
  ng: "Viết ngh trước e, ê, i; viết ng trước các âm còn lại.",
  ngh: "Viết ngh trước e, ê, i; viết ng trước các âm còn lại.",
};

const join = (opts: string[]) => (opts.length === 2 ? `${opts[0]} hay ${opts[1]}` : `${opts.slice(0, -1).join(", ")} hay ${opts[opts.length - 1]}`);
const blanks = (w: string) => [...w.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
const plain = (w: string) => w.replace(/\[([^\]]+)\]/g, "$1");

/**
 * Điền âm đầu / vần còn thiếu. `only` thu hẹp lựa chọn trong một kho (VD "r-d-gi" chỉ lấy d / gi),
 * khi đó chỉ chọn từ có chỗ trống thuộc các lựa chọn đó.
 */
export function chinhTa(id: string, only?: string[]): Generator {
  const b = bank(id);
  const options = only ?? b.options;
  const isVan = b.part === "van";
  const key = (x: string) => (isVan ? stripTone(x) : x);
  const pool = b.words.filter((w) => blanks(w).some((x) => options.includes(key(x))));
  if (pool.length < 4) throw new Error(`Kho ${id} (${options.join("/")}) quá ít từ`);
  return (r) => {
    const w = pick(r, pool);
    let hidden = "";
    let done = false;
    const shown = w.replace(/\[([^\]]+)\]/g, (_, x: string) => {
      if (!done && options.includes(key(x))) { done = true; hidden = x; return "…"; }
      return x;
    });
    const answer = key(hidden);
    const what = isVan ? "vần" : "chữ";
    const hint = HINT[answer] ? ` ${HINT[answer]}` : "";
    return mcFixed(
      `Chọn ${what} ${join(options)} điền vào chỗ trống: “${shown}”`,
      options, answer, `Viết đúng: “${plain(w)}”.${hint}`, ["chính tả", id],
    );
  };
}

/* ───────────── Dấu hỏi / dấu ngã ─────────────
   [ ] đánh dấu tiếng cần chọn dấu; câu hỏi hiện tiếng đó không dấu. */

export const HOI_NGA: string[] = [
  "chim [sẻ]", "[nghỉ] hè", "[mở] cửa", "con [thỏ]", "học [giỏi]", "[nhảy] dây", "[hỏi] bài", "[bảo] vệ",
  "[kể] chuyện", "[khoẻ] mạnh", "màu [đỏ]", "[cỏ] non", "[củ] cải", "cái [chổi]", "[ngủ] ngon", "cái [tủ]",
  "suy [nghĩ]", "[vẽ] tranh", "[sữa] chua", "bị [ngã]", "[mũ] len", "đôi [đũa]", "bàn [gỗ]", "[gỡ] rối",
  "[dũng] cảm", "[sẽ] đến", "[ngõ] nhỏ", "cái [võng]", "[dễ] thương", "[lễ] hội", "[vững] vàng", "[nhãn] vở",
];

const TONE_NAME = { hoi: "dấu hỏi", nga: "dấu ngã" } as const;

export const hoiNga: Generator = (r) => {
  const w = pick(r, HOI_NGA);
  const target = blanks(w)[0];
  const tone = stripTone(target) === target ? null : (target.normalize("NFD").includes("̉") ? "hoi" : "nga");
  if (!tone) throw new Error(`HOI_NGA: “${w}” thiếu dấu`);
  const bare = stripTone(target);
  const shown = w.replace(/\[([^\]]+)\]/, bare);
  return mcFixed(
    `Tiếng “${bare}” trong “${shown}” cần thêm dấu hỏi hay dấu ngã?`,
    [TONE_NAME.hoi, TONE_NAME.nga], TONE_NAME[tone], `Viết đúng: “${plain(w)}”.`, ["chính tả", "hỏi-ngã"],
  );
};
