// Dọn văn bản thô từ OCR (Tesseract) cho vừa định dạng mà `parseExamText` hiểu.
//
// Đo trên ảnh đề thật, Tesseract hay:
// - gộp khoảng trắng, nên dòng đáp án ngang "A. 4    B. 5    C. 6" thành
//   "A. 4 B. 5 C. 6" — mất 2+ dấu cách mà OPT_TWO cần, OPT_ONE nuốt cả dòng;
// - bỏ dấu cách sau mốc ("A.235");
// - đọc chữ C thành "Cc" ("Cc.325").
// Ở đây tách lại mỗi đáp án một dòng và viết lại mốc về dạng chuẩn "A. …".

// Mốc đáp án: chữ in hoa A–F (hoặc "Cc") + "." / ")", đứng đầu dòng hoặc sau
// khoảng trắng. Chỉ nhận chữ in hoa: "a) … b) …" là ý nhỏ của câu tự luận.
const OPT_MARK = /(^|\s)([A-F]|Cc)[.)]\s*(?=\S)/g;

type Mark = { letter: string; at: number; end: number };

function findMarks(line: string): Mark[] {
  return [...line.matchAll(OPT_MARK)].map((m) => ({
    letter: m[2][0],
    // Bỏ khoảng trắng phía trước mốc.
    at: m.index! + m[1].length,
    end: m.index! + m[0].length,
  }));
}

// Chuỗi mốc liên tiếp theo thứ tự chữ cái (A rồi B, B rồi C…). Đòi thứ tự để
// câu văn kiểu "… là A. Nam …" không bị cắt nhầm.
function longestRun(marks: Mark[]): Mark[] {
  let best: Mark[] = [];
  let run: Mark[] = [];
  for (const m of marks) {
    const prev = run[run.length - 1];
    run = prev && m.letter.charCodeAt(0) === prev.letter.charCodeAt(0) + 1 ? [...run, m] : [m];
    if (run.length > best.length) best = run;
  }
  return best;
}

function splitLine(line: string): string[] {
  const marks = findMarks(line);
  const run = longestRun(marks);

  if (run.length < 2) {
    // Một đáp án đứng riêng dòng: chỉ chuẩn hoá mốc nếu nó ở đầu dòng.
    const first = marks[0];
    return [first && first.at === 0 ? `${first.letter}. ${line.slice(first.end)}` : line];
  }

  const parts: string[] = [];
  const head = line.slice(0, run[0].at).trim();
  if (head) parts.push(head);
  run.forEach((m, i) => {
    const stop = i + 1 < run.length ? run[i + 1].at : line.length;
    parts.push(`${m.letter}. ${line.slice(m.end, stop).trim()}`);
  });
  return parts;
}

export function cleanOcrText(raw: string): string {
  return raw
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .flatMap((l) => (l ? splitLine(l) : [l]))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
