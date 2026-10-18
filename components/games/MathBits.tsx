// Mảnh hiển thị dùng chung cho các trò Toán: phân số xếp tử trên mẫu dưới, và ba nút
// so sánh > < = (so sánh số lớp 1, phân số lớp 4, số thập phân lớp 5).

import type { ReactNode } from "react";

/** Phân số viết như trong vở: tử số, gạch ngang, mẫu số. */
export function Frac({ n, d, className = "" }: { n: number | string; d: number | string; className?: string }) {
  return (
    <span className={`inline-flex flex-col items-center leading-none align-middle ${className}`} aria-label={`${n} phần ${d}`}>
      <span className="px-1">{n}</span>
      <span className="my-1 h-[3px] w-full rounded bg-current" />
      <span className="px-1">{d}</span>
    </span>
  );
}

/** "3/4" → <Frac/>; chuỗi khác giữ nguyên. */
export function fracLabel(s: string, className?: string): ReactNode {
  const m = s.match(/^(\d+)\/(\d+)$/);
  return m ? <Frac n={m[1]} d={m[2]} className={className} /> : s;
}

const SIGNS = [
  { key: ">", hint: "lớn hơn" },
  { key: "<", hint: "bé hơn" },
  { key: "=", hint: "bằng" },
] as const;

/** Ba lựa chọn > < =, kèm chữ nhỏ cho bé chưa thuộc dấu. Dùng với `optionCols={3}`. */
export const SIGN_OPTIONS = SIGNS.map((s) => ({
  key: s.key,
  label: (
    <span className="flex flex-col items-center">
      <span className="text-5xl leading-none">{s.key}</span>
      <span className="mt-1 text-xs font-semibold text-gray-500">{s.hint}</span>
    </span>
  ),
}));

/** Hai vế cần so sánh, ô dấu hỏi ở giữa. */
export function CompareRow({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6 text-4xl sm:text-5xl font-extrabold text-gray-800">
      {left}
      <span className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border-4 border-dashed border-orange-300 text-orange-500">
        ?
      </span>
      {right}
    </div>
  );
}
