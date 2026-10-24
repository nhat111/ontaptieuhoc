import Link from "next/link";
import { Gift } from "lucide-react";
import LogoMark from "@/components/LogoMark";

// Chân trang chỉ dành cho phụ huynh và học sinh — không có lối vào khu soạn đề
// (người soạn đề vào bằng /import, menu tài khoản, hoặc nút trong /huong-dan/soan-de).
// Chỉ liên kết tới trang có thật, và badge chỉ nói điều site thật sự làm.

const GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Học tập",
    links: [
      { href: "/#grades", label: "Chọn lớp" },
      { href: "/de-thi", label: "Kho đề thi" },
      { href: "/tao-de", label: "Tạo đề giữa kì, cuối kì" },
      { href: "/lop/1/tro-choi", label: "Trò chơi lớp 1–5" },
      { href: "/phieu-bai-tap", label: "Phiếu bài tập in được" },
      { href: "/lam-van/lop-5", label: "Hướng dẫn làm văn lớp 5" },
      { href: "/progress", label: "Tiến độ học tập" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { href: "/huong-dan", label: "Hướng dẫn sử dụng" },
      { href: "/gop-y", label: "Góp ý & báo lỗi" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 lg:grid-cols-[1.6fr_1fr_1fr]">
        {/* Thương hiệu */}
        <div className="col-span-2 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2">
            <LogoMark size={32} />
            <span className="text-base font-extrabold tracking-tight text-slate-900">
              Ôn Tập <span className="text-primary-600">Cùng Con</span>
            </span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
            Mỗi ngày một chút, con tự tin hơn. Bài tập, đề kiểm tra và trò chơi học tập cho lớp 1 đến lớp 9.
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-bold text-success-700 ring-1 ring-success-200">
            <Gift className="h-3.5 w-3.5" aria-hidden />
            Miễn phí · Không cần đăng nhập
          </p>
        </div>

        {GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{group.title}</p>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm font-medium text-slate-600 transition-colors hover:text-primary-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Dải bản quyền: nền slate-50 tách khỏi phần link nền trắng phía trên */}
      <div className="border-t border-slate-200 bg-slate-50">
        <p className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-500 sm:text-left">
          © {new Date().getFullYear()} Ôn Tập Cùng Con • Phát triển bởi NhatLab
        </p>
      </div>
    </footer>
  );
}
