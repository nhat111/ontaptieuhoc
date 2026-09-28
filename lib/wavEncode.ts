// Làm sạch bản thu ngay trên máy trước khi tải lên:
// cắt khoảng lặng đầu/cuối → chỉnh âm lượng đều → hạ tần số lấy mẫu → WAV 16-bit.
//
// Nhận mẫu PCM thô từ lib/micRecorder.ts — không giải mã file nén nào, nên
// không vướng lỗi codec của từng trình duyệt (xem ghi chú ở micRecorder).
//
// Vì sao WAV: máy nào cũng phát được, và một câu vài giây ở ~24 kHz mono chỉ
// cỡ 100–200KB.

const PAD_S = 0.15; // lặng hai đầu: vài máy nuốt mất phần đầu khi vừa phát
const KEEP_BEFORE_S = 0.15; // giữ lại chút trước/sau tiếng nói để không cụt âm (phụ âm đầu, đuôi thanh)
const KEEP_AFTER_S = 0.3;

export function pcmToCleanWav(input: Float32Array, inputRate: number): { wav: Blob; seconds: number } {
  // Hạ về ~22–24 kHz bằng cách lấy trung bình từng cặp mẫu (đồng thời lọc bớt
  // tần số cao), đủ cho giọng nói mà file nhẹ một nửa.
  let rate = inputRate;
  let mono = input;
  while (rate >= 44100) {
    const half = new Float32Array(Math.floor(mono.length / 2));
    for (let i = 0; i < half.length; i++) half[i] = (mono[2 * i] + mono[2 * i + 1]) / 2;
    mono = half;
    rate = rate / 2;
  }

  // Tìm đoạn có tiếng theo năng lượng từng khung 10 ms.
  const frame = Math.max(1, Math.round(rate * 0.01));
  let peak = 0;
  for (const x of mono) peak = Math.max(peak, Math.abs(x));
  const thresh = Math.max(0.015, peak * 0.08);
  let first = -1;
  let last = -1;
  for (let f = 0; f * frame < mono.length; f++) {
    let sum = 0;
    const end = Math.min(mono.length, (f + 1) * frame);
    for (let i = f * frame; i < end; i++) sum += mono[i] * mono[i];
    if (Math.sqrt(sum / (end - f * frame)) > thresh) {
      if (first < 0) first = f * frame;
      last = end;
    }
  }
  if (first < 0) throw new Error("silent");

  const start = Math.max(0, first - Math.round(rate * KEEP_BEFORE_S));
  const stop = Math.min(mono.length, last + Math.round(rate * KEEP_AFTER_S));
  const voiced = mono.subarray(start, stop);

  // Đưa đỉnh về 0.9, nhưng không khuếch đại quá 4 lần (đỡ to cả tiếng ồn).
  const gain = peak > 0 ? Math.min(4, 0.9 / peak) : 1;

  const pad = Math.round(rate * PAD_S);
  const pcm = new Int16Array(new ArrayBuffer((pad + voiced.length + pad) * 2));
  for (let i = 0; i < voiced.length; i++) {
    const x = Math.max(-1, Math.min(1, voiced[i] * gain));
    pcm[pad + i] = x < 0 ? x * 0x8000 : x * 0x7fff;
  }
  return { wav: encodeWav(pcm, Math.round(rate)), seconds: pcm.length / rate };
}

function encodeWav(pcm: Int16Array<ArrayBuffer>, rate: number): Blob {
  const header = new DataView(new ArrayBuffer(44));
  const str = (o: number, s: string) => [...s].forEach((c, i) => header.setUint8(o + i, c.charCodeAt(0)));
  const bytes = pcm.length * 2;
  str(0, "RIFF");
  header.setUint32(4, 36 + bytes, true);
  str(8, "WAVE");
  str(12, "fmt ");
  header.setUint32(16, 16, true); // kích thước khối fmt
  header.setUint16(20, 1, true); // PCM
  header.setUint16(22, 1, true); // mono
  header.setUint32(24, rate, true);
  header.setUint32(28, rate * 2, true); // byte/giây
  header.setUint16(32, 2, true); // byte/mẫu
  header.setUint16(34, 16, true); // bit/mẫu
  str(36, "data");
  header.setUint32(40, bytes, true);
  return new Blob([header, pcm], { type: "audio/wav" });
}
