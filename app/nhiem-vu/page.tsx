import type { Metadata } from "next";
import Header from "@/components/Header";
import MissionHub from "@/components/mission/MissionHub";
import { MISSION_GRADES, MISSION_SIZE, type MissionBai } from "@/lib/mission";
import { missionBaiList } from "@/lib/missionRows";

export const metadata: Metadata = {
  title: "Nhiệm vụ mỗi ngày và album sticker",
  description: `Mỗi ngày ${MISSION_SIZE} câu Toán lớp 1–5 theo đúng bài sách Kết nối tri thức con đang học, giữ chuỗi ngày liên tục và sưu tầm sticker. Miễn phí, không cần đăng nhập.`,
  alternates: { canonical: "/nhiem-vu" },
};

export default function MissionPage() {
  // Danh sách bài làm được trên máy của từng lớp — trang chỉ nhận dữ liệu nhẹ này, không nhận bộ sinh câu.
  const lists: Record<number, MissionBai[]> = Object.fromEntries(MISSION_GRADES.map((g) => [g, missionBaiList(g)]));
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <section className="border-b border-slate-200 bg-gradient-to-br from-orange-50 via-white to-amber-50/70">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Nhiệm vụ mỗi ngày</h1>
          <p className="mt-2 leading-relaxed text-slate-600">
            {MISSION_SIZE} câu Toán mỗi ngày, khoảng 3 phút, theo đúng bài con đang học. Làm đều mỗi ngày để giữ chuỗi 🔥 và mở sticker mới cho album.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
        <MissionHub lists={lists} />
      </div>
    </div>
  );
}
