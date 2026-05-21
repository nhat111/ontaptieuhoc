import Header from "@/components/Header";
import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Spinner label="Đang tải lịch sử…" />
      </div>
    </div>
  );
}
