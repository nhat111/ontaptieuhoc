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
      className={`group relative flex flex-col rounded-2xl border ${color.border} ${color.bg} overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer ring-0 hover:ring-4 ${color.ring}`}
    >
      {/* Accent top bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${color.accent}`} />

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Emoji + badge row */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold ${color.badge} ${color.text} px-2 py-0.5 rounded-full`}>
            Lớp {grade}
          </span>
          <span className="text-2xl sm:text-3xl leading-none">{emoji}</span>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-gray-800 leading-tight">Lớp {grade}</h2>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">{totalTopics} chủ đề · {subjects.length} môn</p>
        </div>

        {/* Subjects — show max 3 on mobile */}
        <ul className="flex flex-wrap gap-1">
          {subjects.slice(0, 3).map((subject) => (
            <li
              key={subject}
              className={`text-[10px] sm:text-xs font-medium ${color.badge} ${color.text} px-2 py-0.5 rounded-lg leading-tight`}
            >
              {subject}
            </li>
          ))}
          {subjects.length > 3 && (
            <li className={`text-[10px] sm:text-xs font-medium ${color.badge} ${color.text} px-2 py-0.5 rounded-lg leading-tight`}>
              +{subjects.length - 3}
            </li>
          )}
        </ul>

        {/* CTA */}
        <div className={`mt-auto flex items-center gap-1 text-xs font-semibold ${color.hover} transition-colors pt-1`}>
          <span>Vào học</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </a>
  );
}
