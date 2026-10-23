"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ACTION_DANGER, ACTION_MD, ACTION_SM } from "./actionStyles";

async function sendDelete(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { method: "DELETE" });
    if (res.ok) return null;
    const data = await res.json().catch(() => null);
    return data?.error ?? `Lỗi ${res.status}`;
  } catch {
    return "Không kết nối được máy chủ.";
  }
}

/**
 * Xoá một bài học / đề kiểm tra sau khi hỏi lại. Không có thùng rác: xoá là mất,
 * nên câu hỏi xác nhận nêu rõ tên và số câu.
 *
 * `redirectTo` cho trang sửa đề (bài đã xoá thì không ở lại được); bỏ trống thì
 * chỉ tải lại dữ liệu trang hiện tại.
 */
export function DeleteLessonButton({
  lessonId,
  title,
  questionCount,
  isExam,
  redirectTo,
  className,
}: {
  lessonId: number;
  title: string;
  questionCount?: number;
  isExam: boolean;
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const noun = isExam ? "đề" : "bài";

  const onClick = async () => {
    const count = questionCount === undefined ? "" : ` (${questionCount} câu hỏi)`;
    if (!window.confirm(`Xoá ${noun} "${title}"${count}?\nKhông khôi phục được.`)) return;
    setBusy(true);
    const err = await sendDelete(`/api/lesson/${lessonId}`);
    if (err) {
      setBusy(false);
      window.alert(`Không xoá được: ${err}`);
      return;
    }
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      setBusy(false);
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={className ?? `${ACTION_SM} ${ACTION_DANGER}`}
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden />
      {busy ? "Đang xoá..." : `Xoá ${noun}`}
    </button>
  );
}

/** Xoá cả chương: mọi bài/đề và câu hỏi bên trong đi theo. */
export function DeleteChapterButton({
  chapterId,
  title,
  lessonCount,
  redirectTo,
}: {
  chapterId: number;
  title: string;
  lessonCount: number;
  redirectTo: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    const inside = lessonCount > 0 ? ` và cả ${lessonCount} bài/đề bên trong` : "";
    if (!window.confirm(`Xoá chương "${title}"${inside}?\nKhông khôi phục được.`)) return;
    setBusy(true);
    const err = await sendDelete(`/api/chapters?id=${chapterId}`);
    if (err) {
      setBusy(false);
      window.alert(`Không xoá được: ${err}`);
      return;
    }
    router.push(redirectTo);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`${ACTION_MD} ${ACTION_DANGER}`}
    >
      <Trash2 className="h-4 w-4" aria-hidden />
      {busy ? "Đang xoá..." : "Xoá chương"}
    </button>
  );
}
