import Link from "next/link";

export type Lesson = {
  id: number;
  index: string;
  title: string;
  questionCount: number;
  status: "completed" | "active" | "locked";
};

const circleStyle: Record<Lesson["status"], string> = {
  completed: "bg-green-500 text-white",
  active: "bg-blue-500 text-white",
  locked: "bg-gray-200 text-gray-400",
};

const statusBadge: Record<Lesson["status"], { label: string; cls: string }> = {
  completed: { label: "Đã xong", cls: "bg-green-100 text-green-600" },
  active: { label: "Đang học", cls: "bg-blue-100 text-blue-600" },
  locked: { label: "Ôn tập", cls: "bg-gray-100 text-gray-500" },
};

export default function LessonItem({
  lesson,
  isLast,
}: {
  lesson: Lesson;
  isLast: boolean;
}) {
  const badge = statusBadge[lesson.status];

  return (
    <div className="flex gap-3">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 ${circleStyle[lesson.status]}`}
        >
          {lesson.status === "locked" ? "🔒" : lesson.index}
        </div>
        {!isLast && <div className="w-0.5 bg-gray-200 flex-1 mt-1 min-h-4" />}
      </div>

      {/* Card — tất cả đều có link */}
      <Link href={`/quiz?lessonId=${lesson.id}`} className="flex-1 block mb-3">
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 shadow-sm transition-all group ${
            lesson.status === "locked"
              ? "bg-gray-50 border-gray-100 hover:border-gray-200 hover:bg-gray-100"
              : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-md"
          }`}
        >
          <div>
            <p
              className={`text-sm font-semibold transition-colors ${
                lesson.status === "locked"
                  ? "text-gray-400 group-hover:text-gray-600"
                  : "text-gray-800 group-hover:text-blue-600"
              }`}
            >
              {lesson.title}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{lesson.questionCount} câu hỏi</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ml-3 whitespace-nowrap ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
      </Link>
    </div>
  );
}
