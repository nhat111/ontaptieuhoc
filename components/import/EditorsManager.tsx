"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus } from "lucide-react";
import { ACTION_DANGER, ACTION_MD, ACTION_PRIMARY, ACTION_SM } from "./actionStyles";

/** Ô mời người soạn (nhiều email một lần) — trang /import/nguoi-soan. */
export function InviteEditorsForm() {
  const router = useRouter();
  const [emails, setEmails] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/editors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ ok: false, text: data.error ?? `Lỗi ${res.status}` });
        return;
      }
      setMsg({ ok: true, text: `Đã mời ${data.added.length} người. Gửi cho họ đường dẫn bên dưới.` });
      setEmails("");
      setNote("");
      router.refresh();
    } catch {
      setMsg({ ok: false, text: "Không kết nối được máy chủ." });
    } finally {
      setBusy(false);
    }
  };

  const field =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-300";
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700">
        Email người được mời <span className="font-normal text-slate-500">(nhiều email thì mỗi dòng một email, hoặc ngăn bằng dấu phẩy)</span>
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          rows={3}
          placeholder={"co.lan@gmail.com\nthay.binh@gmail.com"}
          className={`${field} mt-1`}
        />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Ghi chú <span className="font-normal text-slate-500">(không bắt buộc, vd “Cô Lan – lớp 3A”)</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} className={`${field} mt-1`} />
      </label>
      <button type="button" onClick={submit} disabled={busy || !emails.trim()} className={`${ACTION_MD} ${ACTION_PRIMARY}`}>
        <UserPlus className="h-4 w-4" aria-hidden /> {busy ? "Đang mời…" : "Mời soạn đề"}
      </button>
      {msg && <p className={`text-sm ${msg.ok ? "text-success-700" : "text-coral-700"}`}>{msg.text}</p>}
    </div>
  );
}

/** Thôi mời một người. Bài họ đã soạn vẫn giữ nguyên. */
export function RemoveEditorButton({ email, lessons }: { email: string; lessons: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const onClick = async () => {
    const kept = lessons > 0 ? `\n${lessons} bài người này đã soạn vẫn giữ nguyên, chỉ quản trị sửa được.` : "";
    if (!window.confirm(`Thôi mời ${email}? Người này sẽ không vào khu soạn đề được nữa.${kept}`)) return;
    setBusy(true);
    const res = await fetch(`/api/editors?email=${encodeURIComponent(email)}`, { method: "DELETE" }).catch(() => null);
    setBusy(false);
    if (!res?.ok) {
      const data = await res?.json().catch(() => null);
      window.alert(`Không xoá được: ${data?.error ?? "lỗi kết nối"}`);
      return;
    }
    router.refresh();
  };
  return (
    <button type="button" onClick={onClick} disabled={busy} className={`${ACTION_SM} ${ACTION_DANGER}`}>
      <Trash2 className="h-3.5 w-3.5" aria-hidden /> {busy ? "Đang xoá…" : "Thôi mời"}
    </button>
  );
}
