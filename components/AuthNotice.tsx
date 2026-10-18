import type { ReactNode } from "react";

export type NoticeTone = "error" | "warning" | "success";

const STYLES: Record<NoticeTone, { box: string; icon: string }> = {
  error: { box: "border-red-200 bg-red-50 text-red-800", icon: "text-red-500" },
  warning: { box: "border-amber-200 bg-amber-50 text-amber-900", icon: "text-amber-500" },
  success: { box: "border-green-200 bg-green-50 text-green-800", icon: "text-green-600" },
};

// Đường vẽ kiểu Lucide: alert-circle, clock, check-circle.
const ICONS: Record<NoticeTone, ReactNode> = {
  error: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </>
  ),
  warning: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  success: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
};

/**
 * Hộp thông báo trên trang đăng nhập. `detail` là mã lỗi kỹ thuật: thu gọn
 * trong "Chi tiết", để câu tiếng Việt là thứ người dùng đọc trước.
 */
export default function AuthNotice({
  tone,
  detail,
  children,
}: {
  tone: NoticeTone;
  detail?: string;
  children: ReactNode;
}) {
  const s = STYLES[tone];
  return (
    <div
      role={tone === "success" ? "status" : "alert"}
      className={`flex gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-relaxed ${s.box}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${s.icon}`}
      >
        {ICONS[tone]}
      </svg>
      <div className="min-w-0 flex-1">
        {children}
        {detail && (
          <details className="mt-1.5 text-xs text-slate-500">
            <summary className="cursor-pointer select-none font-medium hover:text-slate-700">Chi tiết</summary>
            <code className="mt-1 block break-all font-mono text-[11px] text-slate-500">{detail}</code>
          </details>
        )}
      </div>
    </div>
  );
}
