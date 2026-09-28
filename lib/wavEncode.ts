// Xử lý bản thu ngay trên trình duyệt trước khi tải lên:
// giải mã → trộn về mono → cắt khoảng lặng đầu/cuối → chỉnh âm lượng đều →
// đổi về 22 kHz → WAV 16-bit.
//
// Vì sao WAV: MediaRecorder cho ra WebM/Opus (Chrome, Android) hoặc MP4/AAC
// (Safari) — iPhone đời cũ không phát được WebM. WAV máy nào cũng phát, và một
// câu vài giây ở 22 kHz mono chỉ cỡ 100–200KB.

const RATE = 22050;
const PAD_S = 0.15; // lặng hai đầu: vài máy nuốt mất phần đầu khi vừa phát
const KEEP_BEFORE_S = 0.15; // giữ lại chút trước/sau tiếng nói để không cụt âm (phụ âm đầu, đuôi thanh)
const KEEP_AFTER_S = 0.3;

export async function toCleanWav(recording: Blob): Promise<{ wav: Blob; seconds: number }> {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  let audio: AudioBuffer;
  try {
    audio = await ctx.decodeAudioData(await recording.arrayBuffer());
  } finally {
    ctx.close().catch(() => {});
  }

  // Trộn mono.
  const mono = new Float32Array(audio.length);
  for (let c = 0; c < audio.numberOfChannels; c++) {
    const data = audio.getChannelData(c);
    for (let i = 0; i < data.length; i++) mono[i] += data[i] / audio.numberOfChannels;
  }

  // Tìm đoạn có tiếng theo năng lượng từng khung 10 ms.
  const frame = Math.max(1, Math.round(audio.sampleRate * 0.01));
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

  const start = Math.max(0, first - Math.round(audio.sampleRate * KEEP_BEFORE_S));
  const stop = Math.min(mono.length, last + Math.round(audio.sampleRate * KEEP_AFTER_S));
  const voiced = mono.subarray(start, stop);

  // Đưa đỉnh về 0.9, nhưng không khuếch đại quá 4 lần (đỡ to cả tiếng ồn).
  const gain = peak > 0 ? Math.min(4, 0.9 / peak) : 1;

  // Đổi tần số lấy mẫu bằng OfflineAudioContext (lọc chống răng cưa có sẵn).
  const src = new AudioBuffer({ length: voiced.length, numberOfChannels: 1, sampleRate: audio.sampleRate });
  src.copyToChannel(Float32Array.from(voiced, (x) => x * gain), 0);
  const outLen = Math.ceil((voiced.length * RATE) / audio.sampleRate);
  const off = new OfflineAudioContext(1, outLen, RATE);
  const node = off.createBufferSource();
  node.buffer = src;
  node.connect(off.destination);
  node.start();
  const resampled = (await off.startRendering()).getChannelData(0);

  const pad = Math.round(RATE * PAD_S);
  const pcm = new Int16Array(new ArrayBuffer((pad + resampled.length + pad) * 2));
  for (let i = 0; i < resampled.length; i++) {
    const x = Math.max(-1, Math.min(1, resampled[i]));
    pcm[pad + i] = x < 0 ? x * 0x8000 : x * 0x7fff;
  }
  return { wav: encodeWav(pcm, RATE), seconds: pcm.length / RATE };
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
