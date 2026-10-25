"""Sinh sẵn file nghe cho đề Tiếng Anh (Tạo đề nhanh, lớp 3–5) bằng Piper: hội thoại của phần
Listening và bài đọc của phần Reading.

Vì sao cần file: phần nghe là một đoạn hội thoại A – B; giọng máy của thiết bị không đọc được
lời thoại mà không lộ đáp án trên màn hình, nên trước đây phần này chỉ in ra giấy cho người lớn
đọc. Có file thì bé bấm "Nghe hội thoại" và làm được ngay trên máy.

Hội thoại: lượt A (giọng nữ), lượt B (giọng nam), nghỉ, rồi cả đoạn thêm lần nữa — như người coi
thi đọc mỗi câu hai lần. Bài đọc: giọng nữ đọc tên bài rồi từng đoạn, nghỉ giữa các đoạn.

Chạy (một lần, trên máy có Python + Node):

    python3 -m venv .venv && .venv/bin/pip install piper-tts lameenc
    # tải en_US-hfc_female-medium và en_US-hfc_male-medium (.onnx + .onnx.json) từ
    # https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US
    rm -f public/audio/tieng-anh/*.mp3   # chỉ khi đổi giọng: file cũ được giữ theo tên nội dung
    .venv/bin/python scripts/gen-en-listen-audio.py path/to/en_US-hfc_female-medium.onnx path/to/en_US-hfc_male-medium.onnx

Chọn giọng bằng cách cho Whisper (small.en) nghe lại và so với lời gốc, 40 hội thoại × 6 cấu hình
(10/2026): hfc_female + hfc_male đọc tốc độ thường sai 4,6% số từ, lessac + ryan 5,7% (đọc chậm
1,2 lần không rõ hơn), amy + joe 5,0%. Lỗi còn lại gần hết ở tên riêng tiếng Việt (Mai, Nam,
Hoan Kiem): giọng Anh đọc theo kiểu Anh, như băng sách; viết lại cách đọc (Nahm, Ling) không
kiểm được bằng máy nên chưa làm.

Ghi ra public/audio/tieng-anh/*.mp3 và lib/enListenClips.ts (lời đọc -> file). Danh sách hội
thoại lấy từ scripts/en-listen-jobs.ts (đọc thẳng enContent*.ts), nên sửa hay thêm hội thoại
thì chỉ cần chạy lại script này. Hội thoại chưa có file vẫn chỉ in, không vỡ gì.
"""

import hashlib
import io
import json
import re
import subprocess
import sys
import wave
from pathlib import Path

import lameenc
from piper import PiperVoice, SynthesisConfig

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "audio" / "tieng-anh"
MANIFEST = ROOT / "lib" / "enListenClips.ts"
URL_PREFIX = "/audio/tieng-anh/"
PARA_GAP_S = 0.9   # giữa các đoạn của bài đọc

# Tốc độ thường: đọc chậm 1,2 lần không giúp máy nghe rõ hơn mà nghe kéo dài; bé muốn chậm thì
# chỉnh tốc độ phát (Chậm/Vừa/Nhanh) trên trang.
CFG = SynthesisConfig(length_scale=1.0, noise_scale=0.4, noise_w_scale=0.5)
TURN_GAP_S = 0.6   # giữa lượt A và lượt B
REPEAT_GAP_S = 2.0  # giữa hai lần đọc
PAD_S = 0.15       # vài máy cắt mất phần đầu khi vừa bắt đầu phát


def jobs() -> dict[str, list[dict[str, str]]]:
    out = subprocess.run(
        ["npx", "tsx", "scripts/en-listen-jobs.ts"], cwd=ROOT, check=True, capture_output=True, text=True
    ).stdout
    return json.loads(out)


def slug(script: str) -> str:
    return hashlib.sha1(script.encode("utf-8")).hexdigest()[:12]


# Tên riêng giọng Anh đọc sai hẳn (Whisper nghe "Ho Chi Minh City" thành "Hokkaido Min City",
# "Nha Trang" thành "an H8 Rang", "PE" thành "N.P.E."): viết lại theo cách đọc cho giọng Anh.
# Chỉ những chỗ đã thử và nghe gần đúng hơn; Mai, Nam, bánh chưng, Hoan Kiem viết lại không khá
# hơn (Hwan Kee-em bị đọc thành "H. Wayne Key M.") nên giữ nguyên.
RESPELL = [
    (r"\bHo Chi Minh\b", "Ho Chee Minh"),
    (r"\bNha Trang\b", "Nyah Trahng"),
    (r"\bLe Loi\b", "Lay Loy"),
    (r"\bNam Dinh\b", "Nam Ding"),
    (r"\bPE\b", "P. E."),
]


def spoken(text: str) -> str:
    """Chữ đưa vào giọng đọc (chữ trên màn hình không đổi).

    Đánh vần "B-E-N" bị đọc thành "Bi Xi'an"; tách thành "B. E. N." thì đọc đúng từng chữ cái.
    """
    text = re.sub(r"\b[A-Z](?:-[A-Z])+\b", lambda m: ". ".join(m.group(0).split("-")) + ".", text)
    for pattern, say in RESPELL:
        text = re.sub(pattern, say, text)
    return text


def synth(voice: PiperVoice, text: str) -> tuple[int, bytes]:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        voice.synthesize_wav(spoken(text), w, syn_config=CFG)
    buf.seek(0)
    with wave.open(buf, "rb") as w:
        return w.getframerate(), w.readframes(w.getnframes())


def silence(rate: int, seconds: float) -> bytes:
    return b"\x00\x00" * int(rate * seconds)


def to_mp3(voice_a: PiperVoice, voice_b: PiperVoice, a: str, b: str) -> bytes:
    rate, pa = synth(voice_a, a)
    rate_b, pb = synth(voice_b, b)
    if rate_b != rate:
        sys.exit(f"Hai giọng khác tần số mẫu ({rate} / {rate_b}); chọn hai giọng cùng chất lượng (medium).")
    once = pa + silence(rate, TURN_GAP_S) + pb
    pcm = silence(rate, PAD_S) + once + silence(rate, REPEAT_GAP_S) + once + silence(rate, PAD_S)
    enc = lameenc.Encoder()
    enc.set_bit_rate(40)
    enc.set_in_sample_rate(rate)
    enc.set_channels(1)
    enc.set_quality(2)
    return enc.encode(pcm) + enc.flush()


def passage_mp3(voice: PiperVoice, title: str, text: str) -> bytes:
    rate = 0
    parts: list[bytes] = []
    for para in [title + "."] + [p.strip() for p in text.split("\n\n") if p.strip()]:
        rate, pcm = synth(voice, para)
        parts.append(pcm)
    gap = silence(rate, PARA_GAP_S)
    pcm = silence(rate, PAD_S) + gap.join(parts) + silence(rate, PAD_S)
    enc = lameenc.Encoder()
    enc.set_bit_rate(40)
    enc.set_in_sample_rate(rate)
    enc.set_channels(1)
    enc.set_quality(2)
    return enc.encode(pcm) + enc.flush()


def ts_string(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    voice_a = PiperVoice.load(sys.argv[1])
    voice_b = PiperVoice.load(sys.argv[2])
    data = jobs()
    dialogues, passages = data["dialogues"], data["passages"]

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    wanted = {slug(j["script"]) + ".mp3" for j in dialogues} | {slug(p["key"]) + ".mp3" for p in passages}
    for old in OUT_DIR.glob("*.mp3"):
        if old.name not in wanted:
            old.unlink()

    listen, reading = [], []
    for j in dialogues:
        name = slug(j["script"]) + ".mp3"
        path = OUT_DIR / name
        # Tên file theo nội dung: hội thoại không đổi thì giữ file cũ, chạy lại nhanh.
        # Đổi giọng hay tốc độ thì xoá thư mục public/audio/tieng-anh rồi chạy lại.
        if not path.exists():
            path.write_bytes(to_mp3(voice_a, voice_b, j["a"], j["b"]))
        listen.append(f"  {ts_string(j['script'])}: {ts_string(URL_PREFIX + name)},")
    for p in passages:
        name = slug(p["key"]) + ".mp3"
        path = OUT_DIR / name
        if not path.exists():
            path.write_bytes(passage_mp3(voice_a, p["title"], p["text"]))
        reading.append(f"  {ts_string(p['key'])}: {ts_string(URL_PREFIX + name)},")

    MANIFEST.write_text(
        "// Sinh tự động bởi scripts/gen-en-listen-audio.py — đừng sửa tay.\n"
        "// Hội thoại (lib/exam5/tiengAnh.ts → listenScript) và bài đọc (→ passageKey) → file trong\n"
        "// public/audio/tieng-anh/.\n"
        "export const EN_LISTEN_CLIPS: Record<string, string> = {\n" + "\n".join(listen) + "\n};\n\n"
        "export const EN_PASSAGE_CLIPS: Record<string, string> = {\n" + "\n".join(reading) + "\n};\n",
        encoding="utf-8",
    )
    print(f"{len(dialogues)} hội thoại, {len(passages)} bài đọc -> {OUT_DIR.relative_to(ROOT)}, {MANIFEST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
