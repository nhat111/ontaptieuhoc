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

  return <ImportClient initialData={data} examMode={data.type === "exam"} />;
}
