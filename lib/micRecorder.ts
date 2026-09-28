// Thu âm thô (PCM) thẳng từ micro bằng Web Audio — KHÔNG dùng MediaRecorder.
//
// Vì sao: trên iPhone (Safari và mọi trình duyệt iOS, vì đều chạy WebKit),
// MediaRecorder xuất MP4/AAC dạng phân mảnh mà `decodeAudioData` của chính
// iOS nhiều bản không giải mã được → "Không xử lý được bản thu". Lấy mẫu PCM
// trực tiếp thì không có bước nén/giải nén nào để hỏng, máy nào cũng như nhau.
//
// Dùng ScriptProcessorNode (cũ nhưng chạy ở mọi trình duyệt, kể cả iOS đời cũ)
// thay vì AudioWorklet (cần file worklet riêng, iOS < 14.5 không có).
//
// `start()` phải được gọi trong handler của cú chạm: iOS chỉ cho AudioContext
// chạy khi được tạo/`resume()` từ thao tác của người dùng.

type Ctx = AudioContext;

export class MicRecorder {
  private ctx: Ctx | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private proc: ScriptProcessorNode | null = null;
  private mute: GainNode | null = null;
  private chunks: Float32Array[] = [];

  /** Xin quyền micro (lần đầu) và bắt đầu gom mẫu. */
  async start(): Promise<void> {
    if (!this.ctx) {
      const C = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new C();
    }
    // Gọi resume ngay trong cú chạm, trước mọi await khác.
    const resumed = this.ctx.resume();
    if (!this.stream) {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    }
    await resumed;

    this.chunks = [];
    this.source = this.ctx.createMediaStreamSource(this.stream);
    this.proc = this.ctx.createScriptProcessor(4096, 1, 1);
    this.proc.onaudioprocess = (e) => {
      // Phải chép ra: trình duyệt dùng lại cùng bộ đệm cho lượt sau.
      this.chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    };
    // ScriptProcessor chỉ chạy khi nối tới đầu ra; nối qua gain 0 để loa không
    // phát lại tiếng micro (tránh hú).
    this.mute = this.ctx.createGain();
    this.mute.gain.value = 0;
    this.source.connect(this.proc);
    this.proc.connect(this.mute);
    this.mute.connect(this.ctx.destination);
  }

  /** Dừng gom mẫu, trả về toàn bộ mẫu đã thu (mono) và tần số lấy mẫu. */
  stop(): { samples: Float32Array; sampleRate: number } {
    this.source?.disconnect();
    this.proc?.disconnect();
    this.mute?.disconnect();
    if (this.proc) this.proc.onaudioprocess = null;
    this.source = this.proc = this.mute = null;

    const total = this.chunks.reduce((n, c) => n + c.length, 0);
    const samples = new Float32Array(total);
    let o = 0;
    for (const c of this.chunks) {
      samples.set(c, o);
      o += c.length;
    }
    this.chunks = [];
    return { samples, sampleRate: this.ctx?.sampleRate ?? 48000 };
  }

  /** Tắt micro hẳn (rời trang). */
  dispose() {
    this.stop();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.ctx?.close().catch(() => {});
    this.ctx = null;
  }
}
