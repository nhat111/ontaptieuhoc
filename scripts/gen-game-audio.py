"""Sinh sẵn file giọng đọc cho các trò chơi lớp 1 bằng giọng neural Edge (vi-VN-HoaiMyNeural).

Vì sao không dùng giọng máy của thiết bị: gặp âm đứng một mình như "á" (chữ ă),
giọng máy trên điện thoại đánh vần thành "a sắc" thay vì đọc âm; trò Tiếng Việt
chơi bằng tai nên đọc sai là hỏng cả trò.

Vì sao Edge, không phải Piper nữa (10/2026): giọng Piper vi_VN-vais1000 nghe máy móc. Cho
Whisper (small, tiếng Việt) nghe lại, Piper ra "Sợi quán" cho "Giỏi quá!", "bé được 7 mô
xào" cho "Bé được 7 ngôi sao!", và "So, now?" cho "Âm á"; giọng HoaiMy ra đúng các câu
và gần đúng các âm. Âm đọc kiểu cô giáo, "Âm, bờ." (dấu phẩy là chỗ ngừng): đọc liền "Âm
bờ" thì hai tiếng dính nhau. Đọc chậm hơn 20% cho bé lớp 1.

Edge chỉ dùng lúc sinh file (một lần, trên máy người soạn); trang web chỉ phát mp3 có sẵn,
không gọi dịch vụ nào.

Chạy (một lần, trên máy có Python, cần mạng):

    python3 -m venv .venv && .venv/bin/pip install edge-tts
    .venv/bin/python scripts/gen-game-audio.py

Thêm các câu Toán lớp 1 (Đếm hình, Hái táo, So sánh phạm vi 10: "3 cộng 2 bằng mấy?", "So sánh 4
và 7", "4 bé hơn 7"…), lấy từ mathClipTexts() trong lib/games.ts qua scripts/game-audio-jobs.ts,
ghi vào GAME_MATH_CLIPS. Bản đồ riêng để trang thu giọng chỉ liệt kê 80 câu Tiếng Việt.

File đã có thì giữ (tên file theo câu), chạy lại chỉ sinh câu mới và xoá file thừa. Đổi giọng
hay tốc độ thì xoá thư mục public/audio/tro-choi rồi chạy lại.

Ghi ra public/audio/tro-choi/*.mp3 và lib/gameClips.ts (câu -> file). Tên file (slug) giữ
nguyên như trước, nên bản thu ở /import/giong-tro-choi (lib/gameRecordings.ts) vẫn khớp và
vẫn được ưu tiên hơn file này.

Âm và từ được ĐỌC THẲNG từ lib/games.ts (VOWELS/CONSONANTS) và
lib/vietWords.ts (WORDS, TONES) nên không phải khai báo hai lần. Câu nào
GameShell nói mà không có file thì cả lượt đó quay về giọng máy, nên quên chạy
lại script cũng không vỡ trò chơi — chỉ kém hay hơn.
"""

import asyncio
import hashlib
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "audio" / "tro-choi"
MANIFEST = ROOT / "lib" / "gameClips.ts"

VOICE = "vi-VN-HoaiMyNeural"
RATE = "-20%"

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


def spoken(text: str) -> str:
    """Chữ đưa vào giọng đọc: "Âm bờ" -> "Âm, bờ." (ngừng sau "Âm"); câu nào cũng có dấu kết thúc."""
    if text.startswith("Âm "):
        text = "Âm, " + text[3:]
    return text if text[-1] in ".!?" else text + "."


async def to_mp3(text: str) -> bytes:
    out = b""
    async for chunk in edge_tts.Communicate(spoken(text), VOICE, rate=RATE).stream():
        if chunk["type"] == "audio":
            out += chunk["data"]
    if not out:
        raise RuntimeError(f"Edge không trả âm thanh cho: {text}")
    return out


def math_texts() -> list[str]:
    out = subprocess.run(
        ["npx", "tsx", "scripts/game-audio-jobs.ts"], cwd=ROOT, check=True, capture_output=True, text=True
    ).stdout
    return json.loads(out)


def render(texts: list[str]) -> list[tuple[str, str]]:
    entries = []
    for text in texts:
        name = slug(text)
        path = OUT_DIR / f"{name}.mp3"
        if not path.exists():
            path.write_bytes(asyncio.run(to_mp3(text)))
        entries.append((text, name))
    return entries


def ts_map(name: str, entries: list[tuple[str, str]]) -> list[str]:
    return [
        f"export const {name}: Record<string, string> = {{",
        *[f'  "{text}": "/audio/tro-choi/{slug_}.mp3",' for text, slug_ in entries],
        "};",
        "",
    ]


def main() -> None:
    if len(sys.argv) != 1:
        sys.exit(__doc__)
    texts = collect()
    maths = [t for t in math_texts() if t not in texts]

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    wanted = {f"{slug(t)}.mp3" for t in texts + maths}
    for old in OUT_DIR.glob("*.mp3"):
        if old.name not in wanted:
            old.unlink()
    entries = render(texts)
    math_entries = render(maths)

    lines = [
        "// TỰ SINH bởi scripts/gen-game-audio.py — đừng sửa tay, chạy lại script.",
        "// Câu các trò chơi nói -> file mp3 đọc sẵn bằng giọng Edge HoaiMy (xem docstring script).",
        "",
        *ts_map("GAME_CLIPS", entries),
        "// Toán lớp 1 (Đếm hình, Hái táo, So sánh phạm vi 10); không có trên trang thu giọng.",
        *ts_map("GAME_MATH_CLIPS", math_entries),
    ]
    MANIFEST.write_text("\n".join(lines), encoding="utf-8")
    print(f"{len(entries)} + {len(math_entries)} câu -> {OUT_DIR.relative_to(ROOT)}, {MANIFEST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
