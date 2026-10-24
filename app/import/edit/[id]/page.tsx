"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import ImportClient, { type InitialData } from "@/components/import/ImportClient";

export default function EditLessonPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<InitialData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/lesson/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d as InitialData);
      })
      .catch(() => setError("Không thể tải dữ liệu bài học."));
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-red-500 font-semibold text-lg mb-4">✗ {error}</p>
          <a href="/import" className="text-blue-600 hover:underline text-sm">← Tạo bài học mới</a>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400 animate-pulse">
          Đang tải bài học...
        </div>
      </div>
    );
  }

  // Người soạn được mời mở bài của người khác (vd từ nút "Sửa đề" ở trang làm bài):
  // nói rõ thay vì cho sửa rồi bị từ chối lúc bấm Lưu.
  if (data.canEdit === false) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <h1 className="text-xl font-extrabold text-slate-900">Bài này do người khác soạn</h1>
          <p className="mt-2 text-sm text-slate-600">Bạn chỉ sửa được bài do chính mình soạn.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <a href={`/quiz?lessonId=${data.lessonId}`} className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700">Xem bài</a>
            <a href="/import/bai-cua-toi" className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white">Bài của tôi</a>
          </div>
        </div>
      </div>
    );
  }

  return <ImportClient initialData={data} examMode={data.type === "exam"} />;
}
