interface GradeCardProps {
  grade: number;
  subjects: string[];
  color: {
    bg: string;
    badge: string;
    text: string;
    border: string;
    hover: string;
    accent: string;
    ring: string;
  };
  emoji: string;
  totalTopics: number;
}

export default function GradeCard({ grade, subjects, color, emoji, totalTopics }: GradeCardProps) {
  return (
    <a
      href={`/lop/${grade}`}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border ${color.border} ${color.bg} shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
    >
      {/* Accent top bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${color.accent} opacity-90`} />

      <div className="flex flex-1 flex-col gap-3 p-3.5 sm:p-4">
        {/* Emoji + badge row */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${color.badge} ${color.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${color.accent}`} />
            Lớp {grade}
          </span>
          <span className="text-2xl leading-none sm:text-3xl">{emoji}</span>
        </div>

        {/* Title */}
        <h2 className="text-base font-extrabold leading-tight text-slate-800 sm:text-lg">
          Ôn tập lớp {grade}
        </h2>

        <p className="text-[11px] text-slate-500/90 sm:text-xs">{totalTopics} chủ đề</p>

        {/* Subjects — keep concise to avoid text-heavy cards */}
        <ul className="flex flex-wrap gap-1">
          {subjects.slice(0, 2).map((subject) => (
            <li
              key={subject}
              className={`max-w-[88px] truncate rounded-lg border border-white/70 px-2 py-0.5 text-[10px] font-medium leading-tight sm:max-w-none sm:text-xs ${color.badge} ${color.text}`}
            >
              {subject}
            </li>
          ))}
          {subjects.length > 2 && (
            <li className={`rounded-lg border border-white/70 px-2 py-0.5 text-[10px] font-medium leading-tight sm:text-xs ${color.badge} ${color.text}`}>
              +{subjects.length - 2} môn
            </li>
          )}
        </ul>

        {/* CTA */}
        <div className={`mt-auto flex items-center gap-1 pt-1 text-xs font-semibold transition-colors ${color.hover}`}>
          <span>Bắt đầu</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </a>
  );
}
