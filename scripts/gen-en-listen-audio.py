"""Sinh sẵn file nghe cho phần Listening của đề Tiếng Anh (Tạo đề nhanh, lớp 3–5) bằng Piper.

Vì sao cần file: phần nghe là một đoạn hội thoại A – B; giọng máy của thiết bị không đọc được
lời thoại mà không lộ đáp án trên màn hình, nên trước đây phần này chỉ in ra giấy cho người lớn
đọc. Có file thì bé bấm "Nghe hội thoại" và làm được ngay trên máy.

Mỗi file: lượt A (giọng nữ), lượt B (giọng nam), nghỉ, rồi cả đoạn thêm lần nữa — như người coi
thi đọc mỗi câu hai lần.

Chạy (một lần, trên máy có Python + Node):

    python3 -m venv .venv && .venv/bin/pip install piper-tts lameenc
    # tải en_US-lessac-medium và en_US-ryan-medium (.onnx + .onnx.json) từ
    # https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US
    .venv/bin/python scripts/gen-en-listen-audio.py path/to/en_US-lessac-medium.onnx path/to/en_US-ryan-medium.onnx

Ghi ra public/audio/tieng-anh/*.mp3 và lib/enListenClips.ts (lời đọc -> file). Danh sách hội
thoại lấy từ scripts/en-listen-jobs.ts (đọc thẳng enContent*.ts), nên sửa hay thêm hội thoại
thì chỉ cần chạy lại script này. Hội thoại chưa có file vẫn chỉ in, không vỡ gì.
"""

import hashlib
import io
import json
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

# Chậm hơn giọng mặc định một chút cho học sinh tiểu học.
CFG = SynthesisConfig(length_scale=1.2, noise_scale=0.4, noise_w_scale=0.5)
TURN_GAP_S = 0.6   # giữa lượt A và lượt B
REPEAT_GAP_S = 2.0  # giữa hai lần đọc
PAD_S = 0.15       # vài máy cắt mất phần đầu khi vừa bắt đầu phát


def jobs() -> list[dict[str, str]]:
    out = subprocess.run(
        ["npx", "tsx", "scripts/en-listen-jobs.ts"], cwd=ROOT, check=True, capture_output=True, text=True
    ).stdout
    return json.loads(out)


def slug(script: str) -> str:
    return hashlib.sha1(script.encode("utf-8")).hexdigest()[:12]


def synth(voice: PiperVoice, text: str) -> tuple[int, bytes]:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        voice.synthesize_wav(text, w, syn_config=CFG)
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


def ts_string(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    voice_a = PiperVoice.load(sys.argv[1])
    voice_b = PiperVoice.load(sys.argv[2])
    items = jobs()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    wanted = {slug(j["script"]) + ".mp3" for j in items}
    for old in OUT_DIR.glob("*.mp3"):
        if old.name not in wanted:
            old.unlink()

    entries = []
    for j in items:
        name = slug(j["script"]) + ".mp3"
        path = OUT_DIR / name
        # Tên file theo nội dung: hội thoại không đổi thì giữ file cũ, chạy lại nhanh.
        if not path.exists():
            path.write_bytes(to_mp3(voice_a, voice_b, j["a"], j["b"]))
        entries.append(f"  {ts_string(j['script'])}: {ts_string(URL_PREFIX + name)},")

    MANIFEST.write_text(
        "// Sinh tự động bởi scripts/gen-en-listen-audio.py — đừng sửa tay.\n"
        "// Lời đọc (lib/exam5/tiengAnh.ts → listenScript) → file nghe trong public/audio/tieng-anh/.\n"
        "export const EN_LISTEN_CLIPS: Record<string, string> = {\n" + "\n".join(entries) + "\n};\n",
        encoding="utf-8",
    )
    print(f"{len(items)} hội thoại -> {OUT_DIR.relative_to(ROOT)}, {MANIFEST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
