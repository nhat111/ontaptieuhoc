import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import { GRADES } from "@/lib/subjects";

// Chân trang. Chia nhóm theo người dùng: phụ huynh/học sinh ở trên, lối vào khu
// soạn đề để nhỏ ở dải cuối (giống nguyên tắc của Header: nav công khai chỉ cho
// phụ huynh và các em). Chip lớp trung tính, chỉ hover mới đổi màu.

const GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Học tập",
    links: [
      { href: "/de-thi", label: "Kho đề thi" },
      { href: "/lop/1/tro-choi", label: "Trò chơi lớp 1–5" },
      { href: "/phieu-bai-tap", label: "Phiếu bài tập Toán in được" },
      { href: "/progress", label: "Tiến độ học tập" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { href: "/huong-dan", label: "Hướng dẫn sử dụng" },
      { href: "/gop-y", label: "Góp ý & liên hệ" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 lg:grid-cols-[1.6fr_1fr_1fr]">
        {/* Thương hiệu + chọn lớp */}
        <div className="col-span-2 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2">
            <LogoMark size={28} />
            <span className="text-[15px] font-bold tracking-tight text-slate-900">
              Ôn Tập <span className="text-blue-600">Phổ Thông</span>
            </span>
          </Link>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
            Luyện tập miễn phí, bám sát chương trình lớp 1 đến lớp 9.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5 sm:gap-2">
            {GRADES.map((g) => (
              <Link
                key={g}
                href={`/lop/${g}`}
                className="rounded-md border border-slate-200 px-2.5 py-1 text-sm text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
              >
                Lớp {g}
              </Link>
            ))}
          </div>
        </div>

        {GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{group.title}</p>
            <ul className="mt-3 space-y-2">
              {group.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-600 hover:text-slate-900">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Ôn Tập Phổ Thông</p>
          <Link href="/import" className="hover:text-slate-600">
            Dành cho người soạn đề
          </Link>
        </div>
      </div>
    </footer>
  );
}
