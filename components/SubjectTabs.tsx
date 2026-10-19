"use client";
import { useRouter, usePathname } from "next/navigation";
import { gradeTheme } from "@/lib/gradeTheme";

interface Props {
  subjects: string[];
  activeSubject?: string;
  grade?: string;
}

export default function SubjectTabs({ subjects, activeSubject, grade }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (subject: string) => {
    if (grade) {
      router.push(`/lop/${grade}?subject=${encodeURIComponent(subject)}`);
    }
  };

  if (subjects.length === 0) return null;
  const theme = gradeTheme(Number(grade));

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {subjects.map((subject) => (
        <button
          key={subject}
          onClick={() => handleClick(subject)}
          aria-current={subject === activeSubject ? "page" : undefined}
          className={`whitespace-nowrap px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
            subject === activeSubject ? `${theme.solid} text-white` : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {subject}
        </button>
      ))}
    </div>
  );
}
