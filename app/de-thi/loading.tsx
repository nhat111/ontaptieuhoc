import Header from "@/components/Header";
import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-14 text-center">
          <div className="h-7 w-44 bg-white/20 rounded-md mx-auto mb-3 animate-pulse" />
          <div className="h-4 w-56 bg-white/15 rounded-md mx-auto animate-pulse" />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Spinner label="Đang tải đề kiểm tra…" />
      </div>
    </div>
  );
}
