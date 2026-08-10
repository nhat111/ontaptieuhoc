import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import AudioMapper from "@/components/import/AudioMapper";
import { getQuestionsFromDB, getLessonMetaFromDB } from "@/lib/db";

// Gắn file giọng đọc sinh sẵn cho từng câu của một đề.
//
// Dành cho luồng "tự sinh bằng Piper": không tốn hạn mức nhà cung cấp nào, và
// file chỉ phải làm một lần cho mỗi đề.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gắn giọng đọc",
  robots: { index: false, follow: false },
};

export default async function AudioMapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lessonId = Number(id);

  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-10">
          <p className="text-sm text-red-500">Mã bài học không hợp lệ.</p>
        </div>
      </div>
    );
  }

  const [questions, lesson] = await Promise.all([
    getQuestionsFromDB(lessonId),
    getLessonMetaFromDB(lessonId),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs">
          <Link href="/" className="text-blue-500 hover:underline">Trang chủ</Link>
          <span className="text-gray-400">›</span>
          <Link href={`/quiz?lessonId=${lessonId}`} className="text-blue-500 hover:underline">
            {lesson?.title ?? `Bài ${lessonId}`}
          </Link>
          <span className="text-gray-400">›</span>
          <span className="font-medium text-orange-500">Gắn giọng đọc</span>
        </nav>

        <h1 className="mb-1 text-xl font-extrabold text-gray-800">Gắn giọng đọc</h1>
        <p className="mb-6 text-sm text-gray-500">
          Sinh file bằng Piper trên máy rồi tải lên đây. Làm một lần cho mỗi đề, sau đó nghe
          bao nhiêu lần cũng được — không tốn hạn mức của nhà cung cấp nào.
        </p>

        {questions.length === 0 ? (
          <p className="rounded-2xl bg-white p-4 text-sm text-red-500">
            Bài này chưa có câu hỏi nào.
          </p>
        ) : (
          <AudioMapper
            lessonId={lessonId}
            lessonTitle={lesson?.title ?? `Bài ${lessonId}`}
            questions={questions}
          />
        )}
      </div>
    </div>
  );
}
