"use client";

// Hiệu ứng "2.5D" dùng chung cho trò chơi lớp 1: linh vật cú và pháo giấy.
// Toàn bộ là CSS (keyframes trong tailwind.config.ts) — không thêm thư viện,
// máy yếu vẫn chạy mượt. Đều dùng `motion-safe:` để tôn trọng cài đặt giảm
// chuyển động của thiết bị.

export type Mood = "idle" | "happy" | "sad";

/**
 * Bạn Cú đi cùng bé: lơ lửng khi chờ, nhảy lên khi đúng, lắc khi sai.
 * `beat` đổi mỗi lần phản ứng để animation chạy lại dù mood không đổi.
 */
export function Mascot({ mood, text, beat }: { mood: Mood; text: string; beat: number }) {
  const anim =
    mood === "happy" ? "motion-safe:animate-jump" : mood === "sad" ? "motion-safe:animate-shake" : "motion-safe:animate-float";
  return (
    <div className="flex items-end justify-center gap-2 mb-3">
      <span key={beat} className={`text-5xl sm:text-6xl inline-block drop-shadow-md ${anim}`} aria-hidden>
        🦉
      </span>
      <span
        key={`t${beat}`}
        className={`motion-safe:animate-pop relative mb-4 rounded-2xl px-3 py-1.5 text-sm font-bold shadow-sm ${
          mood === "happy"
            ? "bg-green-100 text-green-700"
            : mood === "sad"
              ? "bg-orange-100 text-orange-700"
              : "bg-white text-gray-600 border border-gray-100"
        }`}
      >
        {text}
      </span>
    </div>
  );
}

const CONFETTI = ["🎉", "⭐", "✨", "🌟", "🎊", "💛"];

/**
 * Pháo giấy bung ra từ tâm phần tử cha (cha cần `relative`). Bên gọi đặt
 * `key={id}` để mỗi lần đúng là một lượt bung mới.
 */
export function Burst({ id }: { id: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible" aria-hidden>
      {Array.from({ length: 12 }, (_, i) => {
        // Rải đều quanh vòng tròn, lệch nhẹ theo id để mỗi lần trông khác nhau.
        const angle = (i / 12) * Math.PI * 2 + id;
        const dist = 90 + ((i * 37 + id * 13) % 50);
        return (
          <span
            key={i}
            className="absolute text-2xl motion-safe:animate-burst motion-reduce:hidden"
            style={{
              ["--dx" as string]: `${Math.cos(angle) * dist}px`,
              ["--dy" as string]: `${Math.sin(angle) * dist}px`,
            }}
          >
            {CONFETTI[i % CONFETTI.length]}
          </span>
        );
      })}
    </div>
  );
}
