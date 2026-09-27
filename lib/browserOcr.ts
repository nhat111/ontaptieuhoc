// OCR miễn phí chạy ngay trên trình duyệt bằng Tesseract.js — ảnh không rời
// máy người dùng, không tốn API. Worker, lõi WASM và dữ liệu tiếng Việt (vài MB)
// được tải từ CDN ở lần đầu rồi trình duyệt cache lại.
//
// Chỉ gọi từ client component. Thư viện được import động để không nằm trong
// bundle trang /import khi người dùng không bấm quét.

export type OcrProgress = {
  /** Ảnh đang xử lý, đếm từ 1. */
  index: number;
  total: number;
  phase: "loading" | "recognizing";
  /** 0–1 */
  progress: number;
};

// Ảnh chụp điện thoại thường 4000px+; thu về cỡ này đọc nhanh hơn hẳn mà chữ
// đề in vẫn đủ nét.
const MAX_SIDE = 2400;

async function downscale(file: File): Promise<HTMLCanvasElement | File> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    return canvas;
  } catch {
    // Định dạng trình duyệt không giải mã được — để Tesseract tự thử.
    return file;
  }
}

/** Đọc chữ từ các ảnh theo thứ tự chọn, nối lại thành một văn bản. */
export async function recognizeImages(
  files: File[],
  onProgress?: (p: OcrProgress) => void
): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  let index = 1;
  const worker = await createWorker("vie", undefined, {
    logger: (m) => {
      onProgress?.({
        index,
        total: files.length,
        phase: m.status === "recognizing text" ? "recognizing" : "loading",
        progress: m.progress,
      });
    },
  });

  try {
    const pages: string[] = [];
    for (const file of files) {
      const image = await downscale(file);
      const { data } = await worker.recognize(image);
      pages.push(data.text);
      index++;
    }
    return pages.join("\n\n");
  } finally {
    await worker.terminate();
  }
}
