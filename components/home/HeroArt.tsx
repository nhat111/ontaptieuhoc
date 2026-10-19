/**
 * Hình minh hoạ hero trang chủ: bảng con "2 + 3 = 5", chồng sách, bút chì và huy hiệu
 * ngôi sao. SVG nội tuyến (không tải ảnh), màu theo design system. Trang trí thuần tuý.
 */
export default function HeroArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 300" className={className} aria-hidden>
      {/* Nền: đốm màu mềm */}
      <circle cx="210" cy="160" r="128" fill="#EEF2FF" />
      <circle cx="342" cy="70" r="44" fill="#FEF3C7" />
      <circle cx="70" cy="236" r="34" fill="#D1FAE5" />

      {/* Bảng con */}
      <g className="motion-safe:animate-float" style={{ transformOrigin: "200px 130px" }}>
        <rect x="110" y="56" width="190" height="130" rx="18" fill="#B45309" />
        <rect x="120" y="66" width="170" height="110" rx="12" fill="#1E5B4F" />
        <text x="205" y="132" textAnchor="middle" fontSize="40" fontWeight="800" fill="#F8FAFC" fontFamily="var(--font-nunito), system-ui">
          2 + 3 = 5
        </text>
        <path d="M150 150 q12 -8 24 0 t24 0" stroke="#A7F3D0" strokeWidth="4" fill="none" strokeLinecap="round" />
        <rect x="236" y="156" width="26" height="8" rx="3" fill="#F8FAFC" opacity="0.85" />
      </g>

      {/* Chồng sách */}
      <g>
        <rect x="56" y="196" width="150" height="26" rx="6" fill="#6366F1" />
        <rect x="56" y="196" width="14" height="26" rx="4" fill="#4338CA" />
        <rect x="68" y="222" width="140" height="26" rx="6" fill="#F26D50" />
        <rect x="68" y="222" width="14" height="26" rx="4" fill="#D9533A" />
        <rect x="48" y="248" width="164" height="26" rx="6" fill="#10B981" />
        <rect x="48" y="248" width="14" height="26" rx="4" fill="#059669" />
        <rect x="90" y="205" width="90" height="6" rx="3" fill="#E0E7FF" />
        <rect x="102" y="231" width="80" height="6" rx="3" fill="#FFE7E0" />
        <rect x="84" y="257" width="96" height="6" rx="3" fill="#D1FAE5" />
      </g>

      {/* Bút chì */}
      <g transform="rotate(-28 320 230)">
        <rect x="250" y="220" width="120" height="22" rx="4" fill="#FBBF24" />
        <rect x="250" y="220" width="120" height="7" rx="3" fill="#FCD34D" />
        <rect x="236" y="220" width="18" height="22" rx="4" fill="#FB7185" />
        <rect x="252" y="220" width="8" height="22" fill="#CBD5E1" />
        <path d="M370 220 L396 231 L370 242 Z" fill="#FDE68A" />
        <path d="M388 227.5 L396 231 L388 234.5 Z" fill="#334155" />
      </g>

      {/* Huy hiệu ngôi sao */}
      <g className="motion-safe:animate-sway" style={{ transformOrigin: "342px 40px" }}>
        <path d="M330 92 L322 122 L342 112 L362 122 L354 92 Z" fill="#6366F1" />
        <circle cx="342" cy="72" r="30" fill="#F59E0B" />
        <circle cx="342" cy="72" r="23" fill="#FCD34D" />
        <path
          d="M342 57 L346.4 66 L356 67.3 L349 74 L350.8 83.6 L342 79 L333.2 83.6 L335 74 L328 67.3 L337.6 66 Z"
          fill="#F59E0B"
        />
      </g>

      {/* Lấp lánh */}
      <path d="M86 70 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z" fill="#F59E0B" opacity="0.8" />
      <path d="M318 168 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z" fill="#6366F1" opacity="0.6" />
      <circle cx="58" cy="140" r="5" fill="#F26D50" opacity="0.6" />
      <circle cx="384" cy="150" r="6" fill="#10B981" opacity="0.6" />
    </svg>
  );
}
