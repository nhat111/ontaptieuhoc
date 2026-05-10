"use client";
import { useRouter, usePathname } from "next/navigation";

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

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {subjects.map((subject) => (
        <button
          key={subject}
          onClick={() => handleClick(subject)}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            subject === activeSubject
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
          }`}
        >
          {subject}
        </button>
      ))}
    </div>
  );
}
