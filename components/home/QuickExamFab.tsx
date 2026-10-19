"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

/** Phần tử mà nút nổi nhường chỗ: nút "Tạo đề nhanh" ở hero và thẻ "Làm thử một câu". */
const AVOID_IDS = ["hero-cta", "try-question"];

/**
 * Nút nổi "Tạo đề nhanh" góc dưới phải trang chủ (kiểu nút chat Zalo). Có chữ, không chỉ
 * icon — icon lạ không ai bấm. Chỉ hiện khi nút ở hero và thẻ làm thử đã ra khỏi màn hình:
 * trên điện thoại nó đè đúng đáp án D của thẻ làm thử, và lặp lại nút đang nằm ngay trên.
 * Chỉ đặt ở trang chủ: trong lúc bé làm bài, nút nổi vừa che câu hỏi vừa dễ bấm nhầm.
 */
export default function QuickExamFab() {
  // Server và lần render đầu đều ẩn → không lệch hydration.
  const [show, setShow] = useState(false);

  useEffect(() => {
    const targets = AVOID_IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (targets.length === 0 || typeof IntersectionObserver === "undefined") {
      // Không có gì để nhường chỗ → hiện luôn (qua rAF để không setState đồng bộ trong effect).
      const id = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(id);
    }
    const inView = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) inView.add(e.target);
        else inView.delete(e.target);
      }
      setShow(inView.size === 0);
    });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <Link
      href="/tao-de"
      aria-hidden={!show}
      tabIndex={show ? undefined : -1}
      className={`group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border-b-4 border-primary-800 bg-primary-600 py-2 pl-2 pr-5 text-sm font-extrabold text-white shadow-pop transition-all duration-300 hover:bg-primary-700 active:translate-y-0.5 active:border-b-2 sm:bottom-6 sm:right-6 sm:text-base ${
        show ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary-600" aria-hidden>
        {/* Vòng sáng nháy 3 lần mỗi khi nút hiện ra, rồi thôi. */}
        {show && <span className="absolute inset-0 rounded-full bg-white/70 motion-safe:animate-ping motion-safe:[animation-iteration-count:3]" />}
        <Sparkles className="relative h-5 w-5 transition-transform motion-safe:group-hover:rotate-12" />
      </span>
      Tạo đề nhanh
    </Link>
  );
}
