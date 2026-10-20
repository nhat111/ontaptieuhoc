import Header from "@/components/Header";
import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="border-b border-slate-200 bg-gradient-to-br from-primary-50 via-white to-amber-50/60">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-3 h-9 w-64 animate-pulse rounded-lg bg-slate-200/70" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded-md bg-slate-200/60" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Spinner label="Đang tải đề kiểm tra…" />
      </div>
    </div>
  );
}
