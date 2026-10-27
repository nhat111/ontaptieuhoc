import Link from "next/link";
import { BookX, PartyPopper } from "lucide-react";

/** Trang kết quả: lần nộp này vừa ghi thêm / vừa gạch bao nhiêu mục trong Sổ câu sai. */
export default function WrongBookNotice({ added, cleared }: { added: number; cleared: number }) {
  if (!added && !cleared) return null;
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-start gap-3">
        <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${cleared ? "bg-emerald-50 text-emerald-600" : "bg-coral-50 text-coral-600"}`} aria-hidden>
          {cleared ? <PartyPopper className="h-5 w-5" /> : <BookX className="h-5 w-5" />}
        </span>
        <p className="text-sm text-slate-700">
          {cleared > 0 && <><b>Gạch được {cleared} mục</b> khỏi Sổ câu sai — làm đúng 2 lần liền rồi!{added ? " " : ""}</>}
          {added > 0 && <>Đã ghi <b>{added} mục</b> vào Sổ câu sai để ôn lại bằng câu tương tự.</>}
        </p>
      </div>
      <Link href="/so-cau-sai" className="inline-flex min-h-10 items-center justify-center rounded-xl border-2 border-slate-200 px-4 text-sm font-bold text-slate-700 hover:border-slate-300">
        Mở Sổ câu sai
      </Link>
    </div>
  );
}
