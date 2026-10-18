// Giả lập speechSynthesis kiểu Safari/iOS cho tests/speech.test.ts. Phải được
// import TRƯỚC lib/speech vì module đó chạm vào `window` ngay khi nạp.

export type FakeUtterance = { text: string; onend?: () => void; onerror?: () => void };

export const fake = {
  spoken: [] as string[],
  current: null as FakeUtterance | null,
};

const g = globalThis as Record<string, unknown>;
g.window = {
  speechSynthesis: {
    speaking: false,
    getVoices: () => [],
    addEventListener: () => {},
    speak(u: FakeUtterance) {
      fake.spoken.push(u.text);
      fake.current = u;
    },
    // Safari: huỷ câu đang đọc thì bắn `onend`, không phải `onerror`.
    cancel() {
      const u = fake.current;
      fake.current = null;
      u?.onend?.();
    },
    resume() {},
  },
  localStorage: { getItem: () => null, setItem: () => {} },
};
g.SpeechSynthesisUtterance = class {
  text: string;
  constructor(text: string) {
    this.text = text;
  }
};
