"use client";
import { useState } from "react";
import { MAX_CONTACT, MAX_MESSAGE } from "@/lib/feedback";

/** Form góp ý chung — không cần đăng nhập, liên hệ lại là tuỳ chọn. */
export default function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState(""); // ô bẫy bot
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      setError("Bạn viết vài chữ góp ý nhé.");
      return;
    }
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "general", message, contact, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Chưa gửi được.");
      setState("sent");
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "Chưa gửi được.");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-3xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-4xl">💌</p>
        <p className="mt-2 text-lg font-extrabold text-green-800">Đã nhận góp ý, cảm ơn bạn!</p>
        <p className="mt-1 text-sm text-green-700">
          {contact.trim() ? "Nếu cần, mình sẽ liên hệ lại theo thông tin bạn để lại." : "Mọi góp ý đều được đọc kỹ."}
        </p>
        <button
          type="button"
          onClick={() => {
            setMessage("");
            setState("idle");
          }}
          className="mt-4 text-sm font-semibold text-green-700 underline"
        >
          Gửi thêm góp ý khác
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={send} className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
      <label className="block text-sm font-bold text-gray-700" htmlFor="gop-y-noi-dung">
        Bạn muốn góp ý điều gì?
      </label>
      <textarea
        id="gop-y-noi-dung"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={MAX_MESSAGE}
        rows={5}
        placeholder="Vd: mong có thêm đề Tiếng Việt lớp 3; bài số 5 lớp 2 bị lỗi; web chạy chậm trên điện thoại…"
        className="mt-2 w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
      />
      <p className="mt-1 text-right text-xs text-gray-400">
        {message.length}/{MAX_MESSAGE}
      </p>

      <label className="mt-3 block text-sm font-bold text-gray-700" htmlFor="gop-y-lien-he">
        Email hoặc số điện thoại <span className="font-normal text-gray-400">(không bắt buộc — để lại nếu muốn được trả lời)</span>
      </label>
      <input
        id="gop-y-lien-he"
        type="text"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        maxLength={MAX_CONTACT}
        placeholder="vd: me.be@gmail.com"
        className="mt-2 w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
      />
      {/* Ô bẫy bot: ẩn với người thật */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
      />

      {error && <p className="mt-3 text-sm text-red-600">✗ {error}</p>}
      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-4 w-full rounded-2xl border-b-4 border-blue-800 bg-blue-600 px-6 py-3.5 text-base font-extrabold text-white transition-all hover:bg-blue-500 active:translate-y-0.5 active:border-b-2 disabled:opacity-60 sm:w-auto"
      >
        {state === "sending" ? "Đang gửi…" : "Gửi góp ý"}
      </button>
    </form>
  );
}
