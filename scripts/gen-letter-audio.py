"""Sinh sẵn file giọng đọc cho trò "Nghe và chọn chữ" (lớp 1) bằng Piper.

Vì sao không dùng giọng máy của thiết bị: gặp âm đứng một mình như "á" (chữ ă),
giọng máy trên điện thoại đánh vần thành "a sắc" thay vì đọc âm. Trò này chỉ
chơi bằng tai nên đọc sai là hỏng cả trò. Piper đọc "á" đúng là một âm tiết
(kiểm tra bằng phonemize: "á" -> a: + thanh sắc, còn "a sắc" -> hai âm tiết).

Chạy (một lần, trên máy có Python):

    python3 -m venv .venv && .venv/bin/pip install piper-tts lameenc
    # tải vi_VN-vais1000-medium.onnx + .onnx.json từ
    # https://huggingface.co/rhasspy/piper-voices/tree/main/vi/vi_VN/vais1000/medium
    .venv/bin/python scripts/gen-letter-audio.py path/to/vi_VN-vais1000-medium.onnx

Ghi ra public/audio/chu/*.mp3 và lib/letterClips.ts (bảng câu -> file).
Câu nào GameShell nói mà không có trong bảng thì nó tự quay về giọng máy, nên
thêm âm mới vào lib/games.ts mà quên chạy lại script cũng không vỡ trò chơi.
Nhớ giữ các câu dưới đây khớp với lib/games.ts, LetterGame.tsx và GameShell.tsx.
"""

import io
import sys
import wave
from pathlib import Path

import lameenc
from piper import PiperVoice, SynthesisConfig

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "audio" / "chu"
MANIFEST = ROOT / "lib" / "letterClips.ts"

# Chữ -> (tên file ASCII, âm đọc). Khớp VOWELS / CONSONANTS trong lib/games.ts.
SOUNDS = {
    "a": ("a", "a"), "ă": ("a-trang", "á"), "â": ("a-mu", "ớ"),
    "e": ("e", "e"), "ê": ("e-mu", "ê"), "i": ("i", "i"),
    "o": ("o", "o"), "ô": ("o-mu", "ô"), "ơ": ("o-moc", "ơ"),
    "u": ("u", "u"), "ư": ("u-moc", "ư"),
    "b": ("b", "bờ"), "c": ("c", "cờ"), "d": ("d", "dờ"), "đ": ("dd", "đờ"),
    "g": ("g", "gờ"), "h": ("h", "hờ"), "l": ("l", "lờ"), "m": ("m", "mờ"),
    "n": ("n", "nờ"), "p": ("p", "pờ"), "r": ("r", "rờ"), "s": ("s", "sờ"),
    "t": ("t", "tờ"), "v": ("v", "vờ"), "x": ("x", "xờ"),
}

# Khớp PRAISE và các câu cố định trong GameShell.tsx.
PHRASES = {
    "khen-1": "Giỏi quá!",
    "khen-2": "Đúng rồi!",
    "khen-3": "Tuyệt vời!",
    "khen-4": "Bé làm đúng rồi!",
    "thu-lai": "Chưa đúng, bé thử lại nhé.",
    **{f"ket-qua-{n}": f"Bé được {n} ngôi sao!" for n in range(0, 11)},
}


def to_mp3(voice: PiperVoice, text: str, cfg: SynthesisConfig) -> bytes:
    # Giọng vais1000 nuốt âm cuối nếu câu không có dấu kết thúc ("Âm ớ" chỉ
    # còn ~0,3 giây); thêm dấu chấm thì đọc trọn.
    spoken = text if text[-1] in ".!?" else text + "."
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        voice.synthesize_wav(spoken, w, syn_config=cfg)
    buf.seek(0)
    with wave.open(buf, "rb") as w:
        rate, pcm = w.getframerate(), w.readframes(w.getnframes())
    # 150 ms lặng hai đầu: vài máy cắt mất phần đầu khi vừa bắt đầu phát.
    pad = b"\x00\x00" * int(rate * 0.15)
    pcm = pad + pcm + pad
    enc = lameenc.Encoder()
    enc.set_bit_rate(48)
    enc.set_in_sample_rate(rate)
    enc.set_channels(1)
    enc.set_quality(2)
    return enc.encode(pcm) + enc.flush()


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    voice = PiperVoice.load(sys.argv[1])
    # Giọng này đọc nhanh; kéo chậm cho bé lớp 1 nghe kịp.
    cfg = SynthesisConfig(length_scale=1.6)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    entries: list[tuple[str, str]] = []
    for slug, sound in SOUNDS.values():
        entries.append((f"Âm {sound}", f"am-{slug}"))
    for slug, text in PHRASES.items():
        entries.append((text, slug))

    for text, slug in entries:
        (OUT_DIR / f"{slug}.mp3").write_bytes(to_mp3(voice, text, cfg))
        print(f"{slug}.mp3  <-  {text}")

    lines = [
        "// TỰ SINH bởi scripts/gen-letter-audio.py — đừng sửa tay, chạy lại script.",
        "// Câu GameShell nói -> file mp3 đọc sẵn bằng Piper (xem docstring script).",
        "",
        "export const LETTER_CLIPS: Record<string, string> = {",
        *[f'  "{text}": "/audio/chu/{slug}.mp3",' for text, slug in entries],
        "};",
        "",
    ]
    MANIFEST.write_text("\n".join(lines), encoding="utf-8")
    print(f"-> {MANIFEST.relative_to(ROOT)} ({len(entries)} câu)")


if __name__ == "__main__":
    main()
