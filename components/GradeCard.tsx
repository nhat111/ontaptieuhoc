interface GradeCardProps {
  grade: number;
  subjects: string[];
  color: {
    bg: string;
    badge: string;
    text: string;
    border: string;
    hover: string;
  };
  emoji: string;
  totalTopics: number;
}

export default function GradeCard({ grade, subjects, color, emoji, totalTopics }: GradeCardProps) {
  return (
    <a
      href={`/lop/${grade}`}
      className={`group block rounded-2xl border-2 ${color.border} ${color.bg} p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer`}
    >
      {/* Badge lớp */}
      <div className="flex items-start justify-between mb-4">
        <div className={`${color.badge} ${color.text} text-xs font-bold px-3 py-1 rounded-full`}>
          LỚP {grade}
        </div>
        <span className="text-4xl">{emoji}</span>
      </div>

      {/* Tên lớp */}
      <h2 className="text-2xl font-extrabold text-gray-800 mb-1">
        Lớp {grade}
      </h2>
      <p className="text-gray-500 text-sm mb-4">{totalTopics} chủ đề · {subjects.length} môn học</p>

      {/* Danh sách môn */}
      <ul className="flex flex-wrap gap-2">
        {subjects.map((subject) => (
          <li
            key={subject}
            className={`text-xs font-medium ${color.badge} ${color.text} px-2 py-1 rounded-lg`}
          >
            {subject}
          </li>
        ))}
      </ul>

      {/* Arrow */}
      <div className={`mt-5 flex items-center gap-1 text-sm font-semibold ${color.hover} transition-colors`}>
        <span>Vào học ngay</span>
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </a>
  );
}
