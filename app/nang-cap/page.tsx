import Link from "next/link";
import Header from "@/components/Header";

export const metadata = { title: "Nâng cấp Premium · Ôn Tập Tiểu Học" };

// Phase-1 manual upsell page. Edit the constants below with your real
// payment details. After a transfer, activate the account by setting
// profiles.is_premium = true (and optionally premium_until) in Supabase.
const PRICE_MONTH = "49.000đ / tháng";
const PRICE_YEAR = "299.000đ / năm";
const BANK = { name: "Vietcombank", account: "0123456789", holder: "NGUYEN VAN A" };
const MOMO = "0901234567";

const PERKS = [
  "Tải đề ra Word (.doc) và PDF để in cho con luyện ở nhà",
  "Tải kèm đáp án / lời giải",
  "Báo cáo tiến bộ chi tiết theo môn",
  "Không quảng cáo",
];

export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Nâng cấp Premium</h1>
          <p className="text-orange-100 text-sm sm:text-base">
            Mở khoá tải đề in &amp; báo cáo tiến bộ cho con
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Perks */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-800 mb-3">Premium gồm những gì?</h2>
          <ul className="space-y-2">
            {PERKS.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="bg-amber-50 border border-amber-200 text-amber-700 font-bold text-sm px-4 py-2 rounded-xl">
              {PRICE_MONTH}
            </span>
            <span className="bg-amber-50 border border-amber-200 text-amber-700 font-bold text-sm px-4 py-2 rounded-xl">
              {PRICE_YEAR}
            </span>
          </div>
        </div>

        {/* Payment instructions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-800 mb-3">Cách thanh toán</h2>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>
              Chuyển khoản tới:
              <div className="mt-1 ml-4 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
                <div><span className="text-gray-400">Ngân hàng:</span> <b>{BANK.name}</b></div>
                <div><span className="text-gray-400">Số TK:</span> <b>{BANK.account}</b></div>
                <div><span className="text-gray-400">Chủ TK:</span> <b>{BANK.holder}</b></div>
                <div className="mt-1"><span className="text-gray-400">Hoặc MoMo:</span> <b>{MOMO}</b></div>
              </div>
            </li>
            <li>
              <b>Nội dung chuyển khoản</b> ghi rõ <b>email tài khoản</b> của bạn (để tụi mình kích hoạt đúng người).
            </li>
            <li>Sau khi nhận được, tài khoản sẽ được kích hoạt Premium trong vòng 24 giờ.</li>
          </ol>

          <div className="mt-4 grid place-items-center">
            {/* Drop your QR image at public/payment-qr.png to show it here */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/payment-qr.png"
              alt="Mã QR thanh toán"
              className="w-44 h-44 object-contain rounded-xl border border-gray-200 bg-gray-50"
            />
            <p className="text-[11px] text-gray-400 mt-1">Quét mã QR để chuyển nhanh</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800">
          Chưa có tài khoản? <Link href="/login?redirect=/nang-cap" className="font-semibold underline">Đăng nhập / Đăng ký</Link> trước để tụi mình kích hoạt Premium cho đúng email của bạn.
        </div>
      </div>
    </div>
  );
}
