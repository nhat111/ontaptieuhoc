# Đọc thành tiếng — giọng máy & giọng gắn sẵn

Hai đường đọc, cùng một nút bấm. **Cả hai đều không gọi dịch vụ ngoài, không cần API key, không tốn tiền.**

| Đường | File | Dùng khi |
|-------|------|----------|
| Giọng máy (Web Speech API) | `lib/speech.ts` | Mặc định — không có file gắn sẵn |
| File giọng đọc gắn sẵn | `lib/audioSpeech.ts` | Câu có `audioUrl` trong `explanation` |

TTS đám mây (Gemini/OpenAI) từng có rồi **bị gỡ** — hạn mức free quá nhỏ cho cả một đề. `git log -- lib/tts.ts` nếu cần lại.

## Điểm dùng

- `SpeakButton` — 🔊 một câu + các đáp án của nó
- `QuizClient` — **"Nghe cả bài"**: đọc lần lượt, xướng "Câu N" trước mỗi câu, tự cuộn tới câu đang đọc (`onSegmentStart` mang theo `mark` của segment). Có ở cả màn hình Start lẫn lúc đang làm bài.
- Nút **ẩn hẳn** khi trình duyệt không có `speechSynthesis` và đề không có file nào.

## Tốc độ & giọng

- Tốc độ lưu `localStorage` key `ontap_speech_rate`, mặc định **0.7** — cố ý chậm cho học sinh tiểu học. UI: Chậm / Vừa / Nhanh.
- Đọc qua `useSyncExternalStore` + `subscribeSpeechRate` → không setState-trong-effect, không lệch hydration.
- Với file gắn sẵn, tốc độ áp bằng `playbackRate` (`mapRateToSpeed`), không bao giờ render lại audio.
- `VoicePicker` cho chọn giọng riêng theo ngôn ngữ, lưu `ontap_voice_<lang>`.

## Giọng máy (`lib/speech.ts`)

- **Ngôn ngữ tự nhận theo từng segment**: có dấu tiếng Việt → `vi-VN`, không thì `en-US`. Đáp án không có chữ cái (`"12"`, `"3,5"`) **kế thừa ngôn ngữ của câu hỏi** — nếu không, câu toán tiếng Việt sẽ đọc "one, two" bằng giọng Anh.
- `stripForSpeech` bóc LaTeX và HTML trước khi đọc.
- `voicesFor()` xếp hạng giọng: ưu tiên `Google` / `Enhanced` / `Premium` / `Neural`, trừ điểm `Compact` của iOS, và **loại hẳn giọng novelty/legacy của Apple** (Boing, Bubbles, Zarvox, Fred…) — chúng nằm trong `getVoices()` trông y như giọng en-US bình thường.

### Ba lỗi trình duyệt phải né trong `speakSegments`

Cả ba chỉ cắn khi đọc dài — vì vậy một câu thì chạy tốt mà cả đề thì đứt:

1. Chrome/Safari dừng bộ đọc sau ~15 giây → giữ nhịp bằng `resume()` mỗi 5 giây khi đang đọc.
2. iOS đôi khi **không bắn `onend`** và làm treo chuỗi → mỗi utterance mang thêm timeout theo độ dài để tự đi tiếp.
3. iOS chỉ cho `speak()` **bên trong task của cử chỉ người dùng** → `speakSegments` là hàm **đồng bộ**; không bao giờ `await` trước lần `speak()` đầu tiên, nếu không âm thanh bị chặn im lặng.

### Vì sao vẫn cần giọng gắn sẵn

Safari trên iOS **không phơi** các giọng Enhanced/Premium mà người dùng tải trong Settings → Accessibility → Read & Speak cho trang web — Apple giữ riêng cho app của họ. Bảo người dùng tải giọng xịn về là vô ích với site này. iOS cũng chỉ có đúng một giọng `vi-VN`, nên `VoicePicker` tự ẩn với tiếng Việt trên đó.

## Giọng gắn sẵn (`lib/audioSpeech.ts`)

File được tạo **ngoài app** (Piper trên laptop, hoặc thu thật) rồi upload. Không có provider, không key, không quota.

### Ghép file → câu (`lib/audioFileName.ts`)

Ghép theo **số trong tên file** (`wav_3.wav` → câu 3), **không bao giờ theo thứ tự chọn file** — trình duyệt không đảm bảo thứ tự.

- Bỏ đuôi file trước khi tìm số: `.m4a` / `.mp3` có sẵn chữ số bên trong.
- Lấy số **cuối cùng**: tên thật hay có tiền tố ngày tháng hoặc số bài (`2024-06-01_cau3`, `bai2_cau5`).
- Không tìm được số → trả `null` để giao diện hỏi lại, thà vậy còn hơn đoán bừa.

### `/import/giong-doc/[id]` (`AudioMapper.tsx`)

Ghép sai là lỗi **im lặng** tệ nhất ở đây: bé nghe câu 3 trong khi màn hình hiện câu 5, không ai phát hiện. Nên trang này:

- Nêu tên **mọi file không đặt được**
- Hiện file nào rơi vào câu nào
- Đánh dấu từng dòng **đã lưu / chưa lưu** so với dữ liệu máy chủ
- Mỗi dòng có trình phát để nghe thử trước khi lưu

### Lưu trữ

- `POST /api/upload-audio` → bucket `question-audio`, **đặt tên theo hash nội dung** nên upload lại đúng file đó thì ghi đè chính nó.
- `POST /api/lesson-audio` → **read-merge-write** `audioUrl` vào blob `explanation` đang có, để ảnh và lời giải sống sót.
- Cố ý **không** đi qua `/api/update-lesson`: route đó xoá sạch rồi chèn lại câu hỏi. (Bù lại, `update-lesson` nay gắn lại `audioUrl` theo **nội dung câu**, nên sửa bài không còn phá giọng đọc.)

### Ba bất biến khi phát (comment ở đầu file)

1. Một file WAV im lặng ~5 ms được phát **đồng bộ** để mở khoá audio element ngay trong cú chạm — không `await` gì trước nó, nếu không iOS chặn.
2. **Đúng một** `HTMLAudioElement` cho cả vòng đời trang, vì khoá vừa mở gắn vào chính element đó.
3. Bộ đếm `generation`: bấm dừng thì tăng số, lượt đọc cũ tự thoát im lặng.

`playOne` còn có timeout theo độ dài file vì iOS không phải lúc nào cũng bắn `ended` — thiếu nó là chuỗi đứng luôn ở câu 1.

### Câu thiếu file

Bị bỏ qua, và **số câu bỏ qua được báo ra** (`audioNote` trong `QuizClient`). Đọc mà lặng lẽ nhảy câu thì tệ hơn là nói thẳng.
