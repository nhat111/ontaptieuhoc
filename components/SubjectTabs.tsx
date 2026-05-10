"use client";
import { useState } from "react";

const SUBJECTS = ["Toán", "Tiếng Việt", "Tiếng Anh", "Khoa học", "Đạo đức"];

export default function SubjectTabs() {
  const [active, setActive] = useState("Toán");

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {SUBJECTS.map((subject) => (
        <button
          key={subject}
          onClick={() => setActive(subject)}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            active === subject
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
