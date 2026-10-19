/**
 * Avatar hoạt hình cho bảng xếp hạng: một con vật nhỏ (mèo, gấu, thỏ, cú) vẽ bằng SVG,
 * chọn theo tên nên cùng một bạn luôn ra cùng một con. Không dùng ảnh thật, không emoji.
 */

const PALETTES = [
  { face: "#FDE68A", ear: "#FBBF24", cheek: "#FCA5A5" },
  { face: "#BFDBFE", ear: "#60A5FA", cheek: "#F9A8D4" },
  { face: "#BBF7D0", ear: "#34D399", cheek: "#FCA5A5" },
  { face: "#FBCFE8", ear: "#F472B6", cheek: "#FDA4AF" },
  { face: "#DDD6FE", ear: "#A78BFA", cheek: "#F9A8D4" },
  { face: "#FED7AA", ear: "#FB923C", cheek: "#FCA5A5" },
];

type Kind = "cat" | "bear" | "bunny" | "owl";
const KINDS: Kind[] = ["cat", "bear", "bunny", "owl"];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export default function CuteAvatar({ name, size = 40, className = "" }: { name: string; size?: number; className?: string }) {
  const h = hash(name);
  const p = PALETTES[h % PALETTES.length];
  const kind = KINDS[(h >>> 8) % KINDS.length];

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={`flex-shrink-0 ${className}`} aria-hidden>
      <circle cx="20" cy="20" r="20" fill={p.face} opacity="0.45" />
      {/* Tai */}
      {kind === "cat" && (
        <>
          <path d="M9 15 L11 5 L17 11 Z" fill={p.ear} />
          <path d="M31 15 L29 5 L23 11 Z" fill={p.ear} />
        </>
      )}
      {kind === "bear" && (
        <>
          <circle cx="11" cy="11" r="4.5" fill={p.ear} />
          <circle cx="29" cy="11" r="4.5" fill={p.ear} />
        </>
      )}
      {kind === "bunny" && (
        <>
          <ellipse cx="14" cy="8" rx="3" ry="7" fill={p.ear} />
          <ellipse cx="26" cy="8" rx="3" ry="7" fill={p.ear} />
        </>
      )}
      {kind === "owl" && (
        <>
          <path d="M9 13 L10 6 L15 10 Z" fill={p.ear} />
          <path d="M31 13 L30 6 L25 10 Z" fill={p.ear} />
        </>
      )}
      {/* Mặt */}
      <circle cx="20" cy="22" r="12" fill={p.face} />
      {kind === "owl" ? (
        <>
          <circle cx="15.5" cy="20" r="4" fill="white" />
          <circle cx="24.5" cy="20" r="4" fill="white" />
          <circle cx="15.5" cy="20" r="1.8" fill="#1E293B" />
          <circle cx="24.5" cy="20" r="1.8" fill="#1E293B" />
          <path d="M18.5 24 L20 26.5 L21.5 24 Z" fill="#F59E0B" />
        </>
      ) : (
        <>
          <circle cx="15.5" cy="21" r="1.6" fill="#1E293B" />
          <circle cx="24.5" cy="21" r="1.6" fill="#1E293B" />
          <circle cx="13" cy="25" r="2" fill={p.cheek} opacity="0.8" />
          <circle cx="27" cy="25" r="2" fill={p.cheek} opacity="0.8" />
          <path d="M17.5 25.5 Q20 28 22.5 25.5" stroke="#1E293B" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          {kind === "bear" && <ellipse cx="20" cy="24" rx="1.5" ry="1" fill="#1E293B" />}
        </>
      )}
    </svg>
  );
}
