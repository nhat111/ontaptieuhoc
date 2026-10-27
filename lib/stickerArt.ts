// lib/stickerArt.ts
// Hình sticker cho album ở /nhiem-vu: dùng lại 7 hình mặt cười của phiếu bài tập
// (lib/sheetArt.ts) và vẽ thêm con vật, đồ vật cùng kiểu (nét đậm, màu pastel, mặt cười).
// Tự vẽ bằng SVG, không lấy hình ở đâu khác.

import { ART, cuteFace as face, svgUri as uri } from "./sheetArt";

const ear = (d: string, fill: string, stroke: string) => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>`;
const head = (fill: string, stroke: string, cy = 56, r = 30) => `<circle cx="50" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;

const NEW_ART = {
  cat: uri(
    ear("M24 40 L26 12 L46 30Z", "#fdba74", "#ea580c") + ear("M76 40 L74 12 L54 30Z", "#fdba74", "#ea580c") +
      head("#fed7aa", "#ea580c") +
      `<path d="M30 60 H14 M30 66 H16 M70 60 H86 M70 66 H84" stroke="#9a3412" stroke-width="2" stroke-linecap="round"/>` +
      face(50, 56, 1.05),
  ),
  bear: uri(
    `<circle cx="25" cy="30" r="12" fill="#d6a76c" stroke="#92400e" stroke-width="3"/><circle cx="75" cy="30" r="12" fill="#d6a76c" stroke="#92400e" stroke-width="3"/>` +
      head("#d6a76c", "#92400e") + `<ellipse cx="50" cy="68" rx="14" ry="10" fill="#fde7c4"/>` +
      `<ellipse cx="50" cy="63" rx="4" ry="3" fill="#3f2a1a"/>` + face(50, 52, 1.05),
  ),
  bunny: uri(
    ear("M36 34 C28 6 40 2 44 30Z", "#ffffff", "#ec4899") + ear("M64 34 C72 6 60 2 56 30Z", "#ffffff", "#ec4899") +
      `<path d="M38 30 C34 14 40 12 42 28Z M62 30 C66 14 60 12 58 28Z" fill="#fbcfe8"/>` +
      head("#ffffff", "#ec4899", 60, 28) + face(50, 60, 1),
  ),
  frog: uri(
    `<circle cx="32" cy="30" r="13" fill="#86efac" stroke="#16a34a" stroke-width="3"/><circle cx="68" cy="30" r="13" fill="#86efac" stroke="#16a34a" stroke-width="3"/>` +
      `<ellipse cx="50" cy="60" rx="38" ry="28" fill="#86efac" stroke="#16a34a" stroke-width="3"/>` +
      `<circle cx="32" cy="30" r="6" fill="#1f2937"/><circle cx="68" cy="30" r="6" fill="#1f2937"/><circle cx="34" cy="28" r="2" fill="#fff"/><circle cx="70" cy="28" r="2" fill="#fff"/>` +
      `<path d="M30 64 Q50 80 70 64" fill="none" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>` +
      `<ellipse cx="22" cy="60" rx="5" ry="3" fill="#fb7185" opacity=".6"/><ellipse cx="78" cy="60" rx="5" ry="3" fill="#fb7185" opacity=".6"/>`,
  ),
  chick: uri(
    `<path d="M50 14 Q46 4 54 6 Q50 10 56 14" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>` +
      `<ellipse cx="50" cy="56" rx="34" ry="36" fill="#fde047" stroke="#f59e0b" stroke-width="3"/>` +
      `<path d="M44 58 L56 58 L50 66Z" fill="#fb923c" stroke="#ea580c" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M16 60 Q8 70 20 72 M84 60 Q92 70 80 72" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>` +
      face(50, 48, 0.95).replace(/<path[^>]*\/>$/, ""),
  ),
  fish: uri(
    `<path d="M74 50 L94 34 L94 66Z" fill="#fb923c" stroke="#ea580c" stroke-width="3" stroke-linejoin="round"/>` +
      `<ellipse cx="46" cy="50" rx="34" ry="26" fill="#fdba74" stroke="#ea580c" stroke-width="3"/>` +
      `<path d="M58 30 Q66 40 58 50 M60 52 Q68 60 60 70" fill="none" stroke="#ea580c" stroke-width="2"/>` +
      `<circle cx="22" cy="40" r="3" fill="#bae6fd"/><circle cx="14" cy="28" r="4" fill="#bae6fd"/>` +
      face(38, 48, 0.9),
  ),
  turtle: uri(
    `<circle cx="18" cy="58" r="10" fill="#bef264" stroke="#4d7c0f" stroke-width="3"/>` +
      `<ellipse cx="30" cy="80" rx="8" ry="6" fill="#bef264" stroke="#4d7c0f" stroke-width="3"/><ellipse cx="72" cy="80" rx="8" ry="6" fill="#bef264" stroke="#4d7c0f" stroke-width="3"/>` +
      `<path d="M24 74 Q24 30 56 30 Q88 30 88 74Z" fill="#4ade80" stroke="#15803d" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M40 48 L56 40 L72 48 L72 64 L56 72 L40 64Z" fill="#22c55e" stroke="#15803d" stroke-width="2"/>` +
      `<circle cx="15" cy="56" r="2.4" fill="#1f2937"/><path d="M12 62 Q16 65 20 62" fill="none" stroke="#1f2937" stroke-width="1.8" stroke-linecap="round"/>`,
  ),
  panda: uri(
    `<circle cx="25" cy="30" r="12" fill="#1f2937"/><circle cx="75" cy="30" r="12" fill="#1f2937"/>` +
      head("#ffffff", "#1f2937") +
      `<ellipse cx="37" cy="54" rx="9" ry="11" fill="#1f2937" transform="rotate(-20 37 54)"/><ellipse cx="63" cy="54" rx="9" ry="11" fill="#1f2937" transform="rotate(20 63 54)"/>` +
      `<circle cx="38" cy="54" r="3" fill="#fff"/><circle cx="62" cy="54" r="3" fill="#fff"/>` +
      `<ellipse cx="50" cy="66" rx="4" ry="3" fill="#1f2937"/><path d="M45 71 Q50 76 55 71" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>` +
      `<ellipse cx="30" cy="68" rx="4" ry="2.5" fill="#fb7185" opacity=".6"/><ellipse cx="70" cy="68" rx="4" ry="2.5" fill="#fb7185" opacity=".6"/>`,
  ),
  elephant: uri(
    `<ellipse cx="20" cy="50" rx="16" ry="20" fill="#c7d2fe" stroke="#4f46e5" stroke-width="3"/><ellipse cx="80" cy="50" rx="16" ry="20" fill="#c7d2fe" stroke="#4f46e5" stroke-width="3"/>` +
      head("#a5b4fc", "#4f46e5", 50, 28) +
      `<path d="M44 66 Q42 88 56 90 Q62 90 60 84 Q52 84 54 66Z" fill="#a5b4fc" stroke="#4f46e5" stroke-width="3" stroke-linejoin="round"/>` +
      face(50, 46, 0.95).replace(/<path[^>]*\/>$/, ""),
  ),
  dino: uri(
    `<path d="M30 30 L36 18 L42 30 L48 16 L54 30 L60 20 L64 32" fill="#fde047" stroke="#ca8a04" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<path d="M14 88 Q12 40 50 30 Q88 26 88 60 Q88 88 60 88Z" fill="#6ee7b7" stroke="#059669" stroke-width="3" stroke-linejoin="round"/>` +
      `<circle cx="66" cy="54" r="2.5" fill="#1f2937"/><circle cx="66.6" cy="53" r=".8" fill="#fff"/>` +
      `<path d="M70 66 Q78 70 84 64" fill="none" stroke="#1f2937" stroke-width="2.2" stroke-linecap="round"/>` +
      `<ellipse cx="74" cy="60" rx="4" ry="2.4" fill="#fb7185" opacity=".6"/>` +
      `<circle cx="34" cy="70" r="4" fill="#34d399"/><circle cx="46" cy="78" r="3" fill="#34d399"/>`,
  ),
  rocket: uri(
    `<path d="M50 6 Q72 24 70 62 L30 62 Q28 24 50 6Z" fill="#f1f5f9" stroke="#475569" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M30 46 L16 66 L30 62Z M70 46 L84 66 L70 62Z" fill="#f87171" stroke="#b91c1c" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<path d="M38 62 Q50 96 62 62Z" fill="#fb923c" stroke="#ea580c" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<circle cx="50" cy="34" r="10" fill="#bae6fd" stroke="#475569" stroke-width="3"/>` +
      face(50, 34, 0.55),
  ),
  rainbow: uri(
    [["#f87171", 40], ["#fb923c", 34], ["#facc15", 28], ["#4ade80", 22], ["#60a5fa", 16]]
      .map(([c, r]) => `<path d="M${50 - Number(r)} 66 A${r} ${r} 0 0 1 ${50 + Number(r)} 66" fill="none" stroke="${c}" stroke-width="7"/>`).join("") +
      `<ellipse cx="14" cy="70" rx="12" ry="9" fill="#fff" stroke="#94a3b8" stroke-width="2.5"/><ellipse cx="86" cy="70" rx="12" ry="9" fill="#fff" stroke="#94a3b8" stroke-width="2.5"/>` +
      face(50, 72, 0.7),
  ),
  icecream: uri(
    `<path d="M32 50 L50 94 L68 50Z" fill="#fcd34d" stroke="#b45309" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M38 58 L60 58 M41 66 L58 66 M45 76 L55 76" stroke="#b45309" stroke-width="2"/>` +
      `<circle cx="50" cy="36" r="22" fill="#f9a8d4" stroke="#db2777" stroke-width="3"/>` +
      `<circle cx="50" cy="12" r="5" fill="#ef4444"/>` +
      face(50, 36, 0.8),
  ),
};

export const STICKER_ART: Record<string, string> = { ...ART, ...NEW_ART };
