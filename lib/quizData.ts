export type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
};

export type LessonMeta = {
  id: number;
  title: string;
};

export type QuizResult = {
  questions: Question[];
  answers: (string | null)[];
  lessonId: number;
};

export const LABELS = ["A", "B", "C", "D"] as const;

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const QUESTIONS: Record<number, Question[]> = {
  1: [
    { id: 1, question: "5 + 3 = ?", options: ["6", "7", "8", "9"], correctAnswer: "8" },
    { id: 2, question: "12 - 4 = ?", options: ["6", "7", "8", "9"], correctAnswer: "8" },
    { id: 3, question: "7 + 6 = ?", options: ["12", "13", "14", "15"], correctAnswer: "13" },
    { id: 4, question: "15 - 8 = ?", options: ["5", "6", "7", "8"], correctAnswer: "7" },
    { id: 5, question: "9 + 4 = ?", options: ["11", "12", "13", "14"], correctAnswer: "13" },
    { id: 6, question: "20 - 11 = ?", options: ["8", "9", "10", "11"], correctAnswer: "9" },
    { id: 7, question: "6 + 8 = ?", options: ["13", "14", "15", "16"], correctAnswer: "14" },
    { id: 8, question: "18 - 9 = ?", options: ["7", "8", "9", "10"], correctAnswer: "9" },
  ],
  2: [
    { id: 1, question: "3 × 4 = ?", options: ["10", "11", "12", "13"], correctAnswer: "12" },
    { id: 2, question: "20 ÷ 4 = ?", options: ["4", "5", "6", "7"], correctAnswer: "5" },
    { id: 3, question: "6 × 7 = ?", options: ["40", "41", "42", "43"], correctAnswer: "42" },
    { id: 4, question: "36 ÷ 6 = ?", options: ["5", "6", "7", "8"], correctAnswer: "6" },
    { id: 5, question: "8 × 5 = ?", options: ["35", "40", "45", "50"], correctAnswer: "40" },
    { id: 6, question: "45 ÷ 9 = ?", options: ["4", "5", "6", "7"], correctAnswer: "5" },
  ],
  3: [
    { id: 1, question: "Hình nào có 4 cạnh bằng nhau?", options: ["Hình chữ nhật", "Hình thoi", "Hình vuông", "Hình thang"], correctAnswer: "Hình vuông" },
    { id: 2, question: "Chu vi hình vuông cạnh 5cm là?", options: ["10cm", "15cm", "20cm", "25cm"], correctAnswer: "20cm" },
    { id: 3, question: "Hình tròn có bao nhiêu cạnh?", options: ["0", "1", "2", "Vô số"], correctAnswer: "0" },
    { id: 4, question: "Diện tích hình chữ nhật dài 6cm, rộng 4cm là?", options: ["20cm²", "22cm²", "24cm²", "26cm²"], correctAnswer: "24cm²" },
    { id: 5, question: "Tam giác có bao nhiêu góc?", options: ["2", "3", "4", "5"], correctAnswer: "3" },
  ],
  4: [
    { id: 1, question: "1kg = ? gram", options: ["10g", "100g", "1000g", "10000g"], correctAnswer: "1000g" },
    { id: 2, question: "1 giờ = ? phút", options: ["30", "45", "60", "90"], correctAnswer: "60" },
    { id: 3, question: "Ngày sau thứ Hai là?", options: ["Chủ nhật", "Thứ Ba", "Thứ Tư", "Thứ Sáu"], correctAnswer: "Thứ Ba" },
    { id: 4, question: "500g + 300g = ?", options: ["700g", "800g", "900g", "1kg"], correctAnswer: "800g" },
    { id: 5, question: "1 tuần có bao nhiêu ngày?", options: ["5", "6", "7", "8"], correctAnswer: "7" },
  ],
};

const LESSON_META: Record<number, LessonMeta> = {
  1: { id: 1, title: "Phép cộng và phép trừ" },
  2: { id: 2, title: "Phép nhân và phép chia" },
  3: { id: 3, title: "Hình học cơ bản" },
  4: { id: 4, title: "Đo lường và thời gian" },
};

export function getQuestions(lessonId: number): Question[] {
  return QUESTIONS[lessonId] ?? QUESTIONS[1];
}

export function getLessonMeta(lessonId: number): LessonMeta {
  return LESSON_META[lessonId] ?? LESSON_META[1];
}
