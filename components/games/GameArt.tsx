import type { LucideIcon } from "lucide-react";

/**
 * Hình minh hoạ lớn trên thẻ trò chơi ở Game Hub (/lop/[grade]/tro-choi): SVG nội tuyến
 * nhiều màu, kiểu đồ chơi "2.5D" (khối có bóng dưới, viền sáng). Trò nào chưa có hình
 * riêng thì vẽ biểu tượng Lucide của trò trên một khối tròn.
 */
export default function GameArt({ art, icon: Icon, iconClass = "text-slate-700" }: { art?: string; icon: LucideIcon; iconClass?: string }) {
  const Art = art ? ART[art] : undefined;
  if (Art) return <Art />;
  return (
    <div className="flex h-full w-full items-center justify-center" aria-hidden>
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md ring-[6px] ring-white/50">
        <Icon className={`h-10 w-10 ${iconClass}`} strokeWidth={2.2} />
      </span>
    </div>
  );
}

const Shadow = ({ cx = 60, w = 34 }: { cx?: number; w?: number }) => <ellipse cx={cx} cy="82" rx={w} ry="5" fill="black" opacity="0.1" />;

function AppleArt() {
  return (
    <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden>
      <Shadow />
      <path d="M60 28 C44 18 26 26 28 48 C30 68 46 80 60 74 C74 80 90 68 92 48 C94 26 76 18 60 28 Z" fill="#EF4444" />
      <path d="M60 28 C44 18 26 26 28 48 C30 68 46 80 60 74 Z" fill="#F87171" opacity="0.5" />
      <ellipse cx="44" cy="40" rx="6" ry="10" fill="white" opacity="0.45" transform="rotate(-25 44 40)" />
      <path d="M60 28 Q60 18 64 10" stroke="#78350F" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M64 16 C72 6 86 8 88 14 C80 20 70 20 64 16 Z" fill="#22C55E" />
      <path d="M66 15 Q76 12 86 14" stroke="#15803D" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function ScaleArt() {
  return (
    <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden>
      <Shadow w={28} />
      <path d="M48 82 L60 66 L72 82 Z" fill="#6366F1" />
      <rect x="57" y="18" width="6" height="52" rx="3" fill="#4F46E5" />
      <g transform="rotate(-10 60 22)">
        <rect x="18" y="19" width="84" height="6" rx="3" fill="#4F46E5" />
        <path d="M24 25 L14 46 M24 25 L34 46" stroke="#94A3B8" strokeWidth="1.5" />
        <path d="M96 25 L86 46 M96 25 L106 46" stroke="#94A3B8" strokeWidth="1.5" />
        <path d="M10 46 H38 Q36 56 24 56 Q12 56 10 46 Z" fill="#FBBF24" />
        <path d="M82 46 H110 Q108 56 96 56 Q84 56 82 46 Z" fill="#FBBF24" />
        <text x="24" y="43" textAnchor="middle" fontSize="13" fontWeight="900" fill="#BE123C">7</text>
        <text x="96" y="43" textAnchor="middle" fontSize="13" fontWeight="900" fill="#047857">5</text>
      </g>
      <circle cx="60" cy="18" r="6" fill="#F59E0B" />
      <circle cx="60" cy="18" r="2.5" fill="#FEF3C7" />
      {/* Mặt cười */}
      <circle cx="56" cy="50" r="1.6" fill="white" />
      <circle cx="64" cy="50" r="1.6" fill="white" />
    </svg>
  );
}

function ShapesArt() {
  return (
    <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden>
      <Shadow w={42} />
      <rect x="18" y="44" width="34" height="34" rx="6" fill="#3B82F6" />
      <rect x="18" y="44" width="34" height="9" rx="4" fill="#60A5FA" />
      <path d="M62 78 L80 42 L98 78 Z" fill="#10B981" strokeLinejoin="round" />
      <path d="M80 42 L88 58 L72 58 Z" fill="#34D399" />
      <circle cx="54" cy="30" r="17" fill="#F59E0B" />
      <circle cx="49" cy="25" r="5" fill="white" opacity="0.5" />
      <path d="M92 18 l3 7 l7 1 l-5 5 l1.5 7 l-6.5 -3.5 l-6.5 3.5 l1.5 -7 l-5 -5 l7 -1 Z" fill="#EC4899" />
    </svg>
  );
}

function ClockArt() {
  return (
    <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden>
      <Shadow w={30} />
      <circle cx="40" cy="14" r="8" fill="#F43F5E" />
      <circle cx="80" cy="14" r="8" fill="#F43F5E" />
      <circle cx="60" cy="46" r="32" fill="#F43F5E" />
      <circle cx="60" cy="46" r="26" fill="white" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
        <circle key={i} cx={60 + 21 * Math.sin((i * Math.PI) / 6)} cy={46 - 21 * Math.cos((i * Math.PI) / 6)} r={i % 3 ? 1.3 : 2.2} fill="#334155" />
      ))}
      <path d="M60 46 L60 30" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 46 L73 52" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="46" r="3" fill="#F59E0B" />
      <path d="M40 76 L36 84 M80 76 L84 84" stroke="#BE123C" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function CarArt() {
  return (
    <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden>
      <Shadow w={44} />
      <path d="M6 40 h18 M2 50 h16 M8 60 h12" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <path d="M24 66 L28 48 Q30 42 38 42 L52 30 Q56 26 64 26 L82 26 Q90 26 94 34 L100 46 Q110 48 110 58 L110 66 Z" fill="#EF4444" />
      <path d="M56 32 L64 30 L80 30 Q86 30 88 36 L91 44 L52 44 Z" fill="#BFDBFE" />
      <path d="M70 30 L70 44" stroke="#EF4444" strokeWidth="3" />
      <rect x="30" y="52" width="10" height="5" rx="2" fill="#FDE68A" />
      <circle cx="42" cy="68" r="11" fill="#1E293B" />
      <circle cx="42" cy="68" r="4.5" fill="#CBD5E1" />
      <circle cx="92" cy="68" r="11" fill="#1E293B" />
      <circle cx="92" cy="68" r="4.5" fill="#CBD5E1" />
      <text x="80" y="60" textAnchor="middle" fontSize="11" fontWeight="900" fill="white">×</text>
    </svg>
  );
}

function BalloonArt() {
  return (
    <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden>
      <path d="M40 52 Q44 66 38 84" stroke="#64748B" strokeWidth="1.3" fill="none" />
      <path d="M78 46 Q74 64 80 84" stroke="#64748B" strokeWidth="1.3" fill="none" />
      <path d="M60 40 Q62 60 58 84" stroke="#64748B" strokeWidth="1.3" fill="none" />
      <ellipse cx="40" cy="34" rx="17" ry="20" fill="#3B82F6" />
      <ellipse cx="80" cy="30" rx="17" ry="20" fill="#F59E0B" />
      <ellipse cx="60" cy="24" rx="17" ry="20" fill="#EC4899" />
      <ellipse cx="54" cy="16" rx="4" ry="7" fill="white" opacity="0.45" />
      <ellipse cx="34" cy="27" rx="3.5" ry="6" fill="white" opacity="0.4" />
      <ellipse cx="74" cy="23" rx="3.5" ry="6" fill="white" opacity="0.4" />
      <text x="60" y="30" textAnchor="middle" fontSize="12" fontWeight="900" fill="white">24</text>
    </svg>
  );
}

function CoinsArt() {
  return (
    <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden>
      <Shadow w={40} />
      <g transform="rotate(-8 50 44)">
        <rect x="16" y="26" width="64" height="36" rx="5" fill="#34D399" />
        <rect x="21" y="31" width="54" height="26" rx="3" fill="none" stroke="#065F46" strokeWidth="1.5" opacity="0.5" />
        <text x="48" y="49" textAnchor="middle" fontSize="13" fontWeight="900" fill="#065F46">500</text>
      </g>
      <ellipse cx="86" cy="70" rx="18" ry="7" fill="#B45309" />
      <rect x="68" y="56" width="36" height="14" fill="#B45309" />
      <ellipse cx="86" cy="56" rx="18" ry="7" fill="#FBBF24" />
      <ellipse cx="86" cy="56" rx="11" ry="4" fill="none" stroke="#B45309" strokeWidth="1.5" />
    </svg>
  );
}

function CardsArt() {
  return (
    <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden>
      <Shadow w={40} />
      <g transform="rotate(-12 40 50)">
        <rect x="18" y="22" width="40" height="54" rx="7" fill="#8B5CF6" />
        <path d="M28 40 l10 -8 l10 8 l-10 8 Z M28 58 l10 -8 l10 8 l-10 8 Z" fill="#C4B5FD" />
      </g>
      <g transform="rotate(10 80 48)">
        <rect x="60" y="20" width="40" height="54" rx="7" fill="white" />
        <rect x="60" y="20" width="40" height="54" rx="7" fill="none" stroke="#E2E8F0" strokeWidth="2" />
        <text x="80" y="44" textAnchor="middle" fontSize="11" fontWeight="900" fill="#4F46E5">cao</text>
        <path d="M70 52 h20" stroke="#E2E8F0" strokeWidth="2" />
        <text x="80" y="66" textAnchor="middle" fontSize="11" fontWeight="900" fill="#E11D48">thấp</text>
      </g>
    </svg>
  );
}

const ART: Record<string, () => React.JSX.Element> = {
  apple: AppleArt,
  scale: ScaleArt,
  shapes: ShapesArt,
  clock: ClockArt,
  car: CarArt,
  balloon: BalloonArt,
  coins: CoinsArt,
  cards: CardsArt,
};
