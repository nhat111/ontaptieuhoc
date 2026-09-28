import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import GameVoiceRecorder, { type VoiceGroup } from "@/components/import/GameVoiceRecorder";
import { GAME_CLIPS } from "@/lib/gameClips";
import { TONES, WORDS } from "@/lib/vietWords";

export const metadata: Metadata = {
  title: "Thu giọng cho trò chơi",
  robots: { index: false, follow: false },
};

// Chia 80 câu theo nhóm để người thu đọc cho liền mạch và có gợi ý cách đọc.
function groupTexts(): VoiceGroup[] {
  const all = Object.keys(GAME_CLIPS);
  const words = new Set(WORDS.map((w) => w.word));
  const tones = new Set<string>(TONES.map((t) => t.name));
  const sounds = all.filter((t) => t.startsWith("Âm "));
  const wordTexts = all.filter((t) => words.has(t));
  const toneTexts = all.filter((t) => tones.has(t));
  const taken = new Set([...sounds, ...wordTexts, ...toneTexts]);
  return [
    {
      id: "am",
      title: "Âm (trò Nghe và chọn chữ)",
      tip: "Đọc chậm, rõ như cô giáo dạy: “âm … bờ”. Chữ ă đọc là “á”, â đọc là “ớ”.",
      texts: sounds,
    },
    {
      id: "tu",
      title: "Từ (trò Nhìn hình, Chọn dấu)",
      tip: "Đọc rõ một lần, nhấn đúng dấu thanh.",
      texts: wordTexts,
    },
    {
      id: "dau",
      title: "Tên dấu thanh",
      tip: "Đọc tự nhiên: “dấu sắc”, “dấu huyền”…",
      texts: toneTexts,
    },
    {
      id: "cau",
      title: "Lời khen và câu nhắc",
      tip: "Giọng vui, ấm áp như đang khen bé.",
      texts: all.filter((t) => !taken.has(t)),
    },
  ];
}

export default function GameVoicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link href="/lop/1/tro-choi" className="text-sm text-blue-600 hover:underline">
          ‹ Trò chơi lớp 1
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-800 mt-2">🎙 Thu giọng cho trò chơi</h1>
        <p className="text-sm text-gray-500 mt-1 mb-5">
          Chọn chỗ yên tĩnh, để điện thoại cách miệng một gang tay. Mỗi câu: bấm <b>Bắt đầu thu</b>, đọc, bấm{" "}
          <b>Dừng</b>, nghe lại rồi <b>Lưu</b>.
        </p>
        <GameVoiceRecorder groups={groupTexts()} piper={GAME_CLIPS} />
      </div>
    </div>
  );
}
