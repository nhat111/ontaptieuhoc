"""Sinh sẵn file giọng đọc cho các trò chơi lớp 1 bằng Piper.

Vì sao không dùng giọng máy của thiết bị: gặp âm đứng một mình như "á" (chữ ă),
giọng máy trên điện thoại đánh vần thành "a sắc" thay vì đọc âm; trò Tiếng Việt
chơi bằng tai nên đọc sai là hỏng cả trò. Piper đọc "á" đúng là một âm tiết
(phonemize: "á" -> a: + thanh sắc, còn "a sắc" -> hai âm tiết).

Chỉ giọng vi_VN-vais1000 có đủ 6 thanh; 25hours_single và vivos thiếu thanh
huyền/hỏi (log "Missing phoneme from id map: 2/4") nên không dùng được.

Chạy (một lần, trên máy có Python):

    python3 -m venv .venv && .venv/bin/pip install piper-tts lameenc
    # tải vi_VN-vais1000-medium.onnx + .onnx.json từ
    # https://huggingface.co/rhasspy/piper-voices/tree/main/vi/vi_VN/vais1000/medium
    .venv/bin/python scripts/gen-game-audio.py path/to/vi_VN-vais1000-medium.onnx

Ghi ra public/audio/tro-choi/*.mp3 và lib/gameClips.ts (câu -> file).

Âm và từ được ĐỌC THẲNG từ lib/games.ts (VOWELS/CONSONANTS) và
lib/vietWords.ts (WORDS, TONES) nên không phải khai báo hai lần. Câu nào
GameShell nói mà không có file thì cả lượt đó quay về giọng máy, nên quên chạy
lại script cũng không vỡ trò chơi — chỉ kém hay hơn.
"""

import hashlib
import io
import re
import sys
import unicodedata
import wave
from pathlib import Path

import lameenc
from piper import PiperVoice, SynthesisConfig

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "audio" / "tro-choi"
MANIFEST = ROOT / "lib" / "gameClips.ts"

# Chậm hơn mặc định và bớt "rè" (noise thấp) cho bé lớp 1 nghe rõ. Tiếng đơn
# (âm, từ một tiếng) kéo chậm hơn nữa: giọng này đọc tiếng cuối câu rất gọn.
CFG = SynthesisConfig(length_scale=1.9, noise_scale=0.35, noise_w_scale=0.4)
CFG_SLOW = SynthesisConfig(length_scale=2.4, noise_scale=0.35, noise_w_scale=0.4)
# "Âm … á": đọc hai tiếng riêng rồi chèn khoảng nghỉ, như cô giáo đọc. Đọc liền
# "Âm á" thì hai tiếng dính nhau, cả câu chưa tới 0,6 giây.
PAUSE_S = 0.4

# Câu cố định — khớp GameShell.tsx (PRAISE, thử lại, kết quả) và WordGame.tsx.
PHRASES = [
    "Giỏi quá!",
    "Đúng rồi!",
    "Tuyệt vời!",
    "Bé làm đúng rồi!",
    "Chưa đúng, bé thử lại nhé.",
    "Đây là gì? Bé chọn chữ đúng nhé.",
    *[f"Bé được {n} ngôi sao!" for n in range(0, 11)],
]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def ts_record(src: str, name: str) -> dict[str, str]:
    """Đọc `const NAME: Record<string, string> = { k: "v", ... };` từ file TS."""
    block = re.search(rf"const {name}[^=]*=\s*\{{(.*?)\}};", src, re.S)
    if not block:
        sys.exit(f"Không tìm thấy {name}")
    return dict(re.findall(r'(\S+?):\s*"([^"]+)"', block.group(1)))


def collect() -> list[str]:
    games = read("lib/games.ts")
    sounds = {**ts_record(games, "VOWELS"), **ts_record(games, "CONSONANTS")}
    words_src = read("lib/vietWords.ts")
    words = re.findall(r'\{ word: "([^"]+)"', words_src)
    tone_names = re.findall(r'name: "([^"]+)"', words_src)
    if not sounds or not words or len(tone_names) != 6:
        sys.exit("Đọc lib/games.ts hoặc lib/vietWords.ts thất bại — đã đổi cấu trúc?")
    # Khớp LetterGame (`Âm ${sound}`), ToneGame/WordGame (từ, tên dấu).
    texts = [f"Âm {s}" for s in sounds.values()] + words + tone_names + PHRASES
    return list(dict.fromkeys(texts))  # bỏ trùng, giữ thứ tự


def slug(text: str) -> str:
    """Tên file ASCII đọc được + đuôi hash để không trùng (cá/ca…)."""
    base = unicodedata.normalize("NFD", text).replace("đ", "d").replace("Đ", "D")
    base = "".join(c for c in base if unicodedata.category(c) != "Mn").lower()
    base = re.sub(r"[^a-z0-9]+", "-", base).strip("-")[:32]
    return f"{base}-{hashlib.md5(text.encode()).hexdigest()[:6]}"


def synth(voice: PiperVoice, text: str, cfg: SynthesisConfig) -> tuple[int, bytes]:
    # Giọng vais1000 nuốt âm cuối nếu câu không có dấu kết thúc ("Âm ớ" chỉ
    # còn ~0,3 giây); thêm dấu chấm thì đọc trọn.
    spoken = text if text[-1] in ".!?" else text + "."
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        voice.synthesize_wav(spoken, w, syn_config=cfg)
    buf.seek(0)
    with wave.open(buf, "rb") as w:
        return w.getframerate(), w.readframes(w.getnframes())


def to_mp3(voice: PiperVoice, text: str) -> bytes:
    if text.startswith("Âm "):
        rate, a = synth(voice, "Âm", CFG)
        _, b = synth(voice, text[3:], CFG_SLOW)
        pcm = a + b"\x00\x00" * int(rate * PAUSE_S) + b
    else:
        single = " " not in text.strip(".!?")
        rate, pcm = synth(voice, text, CFG_SLOW if single else CFG)
    # 150 ms lặng hai đầu: vài máy cắt mất phần đầu khi vừa bắt đầu phát.
    pad = b"\x00\x00" * int(rate * 0.15)
    enc = lameenc.Encoder()
    enc.set_bit_rate(64)
    enc.set_in_sample_rate(rate)
    enc.set_channels(1)
    enc.set_quality(2)
    return enc.encode(pad + pcm + pad) + enc.flush()


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    voice = PiperVoice.load(sys.argv[1])
    texts = collect()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob("*.mp3"):
        old.unlink()
    entries = []
    for text in texts:
        name = slug(text)
        (OUT_DIR / f"{name}.mp3").write_bytes(to_mp3(voice, text))
        entries.append((text, name))

    lines = [
        "// TỰ SINH bởi scripts/gen-game-audio.py — đừng sửa tay, chạy lại script.",
        "// Câu các trò chơi nói -> file mp3 đọc sẵn bằng Piper (xem docstring script).",
        "",
        "export const GAME_CLIPS: Record<string, string> = {",
        *[f'  "{text}": "/audio/tro-choi/{name}.mp3",' for text, name in entries],
        "};",
        "",
    ]
    MANIFEST.write_text("\n".join(lines), encoding="utf-8")
    print(f"{len(entries)} câu -> {OUT_DIR.relative_to(ROOT)}, {MANIFEST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
