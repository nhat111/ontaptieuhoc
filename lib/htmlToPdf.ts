// Biến tài liệu HTML in được (buildExamHtml / buildPaperHtml) thành file PDF thật
// ngay trên trình duyệt — không cần server, không cần hộp thoại in.
//
// Cách làm: dựng HTML trong một iframe ẩn rộng đúng khổ A4, tìm chỗ ngắt trang
// không cắt ngang dòng chữ/hình/hàng bảng, chụp từng trang bằng html2canvas rồi
// ghép vào jsPDF. Chụp TỪNG TRANG chứ không chụp cả bài một lần: canvas một đề
// 10 trang ở scale 2 vượt giới hạn diện tích canvas của iOS và ra ảnh trắng.
// Chữ trong PDF là ảnh (không bôi đen được), đổi lại tiếng Việt có dấu luôn
// hiện đúng mà không phải nhúng font.

// A4 ở 96 dpi = 794 × 1123 px; lề 48 px (≈ 12,7 mm) mỗi bên.
const PAGE_W = 794;
const PAGE_H = 1123;
const MARGIN = 48;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const CONTENT_H = PAGE_H - 2 * MARGIN;
const SCALE = 2;

// Phần tử không được cắt ngang khi ngắt trang.
const ATOMIC = "p, h1, h2, h3, li, tr, img, .opt, .ans, .img, .line";

export interface PdfResult {
  blob: Blob;
  /** Ảnh JPEG từng trang (data URL) — dùng để xem trước trên mọi máy, kể cả
   *  Android/iOS vốn không hiện được PDF trong iframe. */
  pages: string[];
}

/** Chọn các điểm ngắt trang (toạ độ y trong body, px). Thuần — có test. */
export function pageBreaks(
  boxes: { top: number; bottom: number }[],
  forced: number[],
  total: number,
  pageH: number,
): number[] {
  const cuts: number[] = [];
  const hard = [...new Set(forced.filter((y) => y > 0 && y < total))].sort((a, b) => a - b);
  // Chỉ những khối thấp hơn một trang mới cần giữ nguyên; khối cao hơn trang
  // thì đằng nào cũng phải cắt.
  const keep = boxes.filter((b) => b.bottom - b.top < pageH);
  const inside = (y: number) => keep.some((b) => b.top < y - 0.5 && y + 0.5 < b.bottom);
  const candidates = [...new Set(boxes.flatMap((b) => [b.top, b.bottom]))].sort((a, b) => a - b);

  let start = 0;
  while (total - start > pageH + 0.5 || hard.some((y) => y > start + 0.5)) {
    const limit = start + pageH;
    const forcedHere = hard.find((y) => y > start + 0.5 && y <= limit);
    let cut: number;
    if (forcedHere !== undefined) {
      cut = forcedHere;
    } else {
      const ok = candidates.filter((y) => y > start + pageH * 0.3 && y <= limit && !inside(y));
      cut = ok.length ? ok[ok.length - 1] : limit;
    }
    cuts.push(cut);
    start = cut;
  }
  return cuts;
}

function waitForLoad(doc: Document): Promise<void> {
  const imgs = [...doc.images].filter((im) => !im.complete);
  const loaded = Promise.all(
    imgs.map((im) => new Promise<void>((r) => { im.onload = im.onerror = () => r(); })),
  );
  const fonts = doc.fonts?.ready.then(() => undefined) ?? Promise.resolve();
  // Ảnh lỗi mạng không được treo cả việc tạo PDF.
  const timeout = new Promise<void>((r) => setTimeout(r, 8000));
  return Promise.race([Promise.all([loaded, fonts]).then(() => undefined), timeout]);
}

export async function htmlToPdf(html: string): Promise<PdfResult> {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas-pro"),
  ]);

  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${CONTENT_W}px;height:${PAGE_H}px;border:0;visibility:hidden;`;
  // Bỏ script tự in (nếu có) và ép body đúng bề rộng vùng in của trang A4.
  const fixed = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(
      "</head>",
      `<style>html,body{background:#fff!important;}body{margin:0!important;padding:0!important;max-width:none!important;width:${CONTENT_W}px!important;}</style></head>`,
    );
  document.body.appendChild(frame);

  try {
    await new Promise<void>((resolve) => {
      frame.onload = () => resolve();
      frame.srcdoc = fixed;
    });
    const doc = frame.contentDocument!;
    await waitForLoad(doc);

    const body = doc.body;
    const origin = body.getBoundingClientRect().top;
    const total = Math.ceil(body.scrollHeight);
    const boxes = [...body.querySelectorAll(ATOMIC)].map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top - origin, bottom: r.bottom - origin };
    }).filter((b) => b.bottom > b.top);
    const forced = [...body.querySelectorAll<HTMLElement>("*")]
      .filter((el) => {
        const cs = frame.contentWindow!.getComputedStyle(el);
        return cs.breakBefore === "page" || cs.breakBefore === "always" ||
          (cs as unknown as { pageBreakBefore?: string }).pageBreakBefore === "always";
      })
      .map((el) => el.getBoundingClientRect().top - origin);

    const cuts = pageBreaks(boxes, forced, total, CONTENT_H);
    const bounds = [0, ...cuts, total];

    const pdf = new jsPDF({ unit: "px", format: [PAGE_W, PAGE_H], orientation: "portrait", hotfixes: ["px_scaling"], compress: true });
    const pages: string[] = [];
    for (let i = 0; i < bounds.length - 1; i++) {
      const y = bounds[i];
      const h = Math.max(1, Math.ceil(bounds[i + 1] - y));
      const canvas = await html2canvas(body, {
        scale: SCALE,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        x: 0,
        y,
        width: CONTENT_W,
        height: h,
        windowWidth: CONTENT_W,
      });
      // Ghép vào khung A4 trắng có lề để ảnh xem trước giống hệt trang PDF.
      const page = document.createElement("canvas");
      page.width = PAGE_W * SCALE;
      page.height = PAGE_H * SCALE;
      const ctx = page.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, page.width, page.height);
      ctx.drawImage(canvas, MARGIN * SCALE, MARGIN * SCALE);
      const url = page.toDataURL("image/jpeg", 0.9);
      pages.push(url);
      if (i > 0) pdf.addPage([PAGE_W, PAGE_H], "portrait");
      pdf.addImage(url, "JPEG", 0, 0, PAGE_W, PAGE_H);
    }

    return { blob: pdf.output("blob"), pages };
  } finally {
    frame.remove();
  }
}
