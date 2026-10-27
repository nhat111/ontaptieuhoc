// In ra (JSON) các câu cần đọc sẵn ngoài âm/từ lớp 1, cho scripts/gen-game-audio.py:
// Toán lớp 1 (math) và Tiền Việt Nam lớp 2 (money).
import { mathClipTexts } from "../lib/games";
import { moneyClipTexts } from "../lib/games2";

console.log(JSON.stringify({ math: mathClipTexts(), money: moneyClipTexts() }));
