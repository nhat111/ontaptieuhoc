import Header from "@/components/Header";
import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-20">
        <Spinner label="Đang tải bài để chỉnh sửa…" />
      </div>
    </div>
  );
}
