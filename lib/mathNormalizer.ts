// Splits text into LaTeX-protected segments and plain-text segments
function splitMath(text: string): { math: boolean; content: string }[] {
  const segments: { math: boolean; content: string }[] = [];
  // Matches: $...$, \(...\), \[...\]
  const re = /(\$[^$]+\$|\\\([^)]+\\\)|\\\[[^\]]+\\\])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) segments.push({ math: false, content: text.slice(last, m.index) });
    segments.push({ math: true, content: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) segments.push({ math: false, content: text.slice(last) });
  return segments;
}

function convertPlain(text: string): string {
  // sqrt(expr) → $\sqrt{expr}$
  text = text.replace(/\bsqrt\(([^)]+)\)/g, (_, inner) => `$\\sqrt{${inner}}$`);
  // n/m where n and m are numbers (or simple expressions) → $\frac{n}{m}$
  // Avoid matching URLs and already-converted \frac
  text = text.replace(
    /(?<![\\$])(\b\d[\d\s.]*)\s*\/\s*(\d[\d\s.]*\b)(?![}$])/g,
    (_, n, d) => `$\\frac{${n.trim()}}{${d.trim()}}$`
  );
  return text;
}

export function normalizeMath(text: string): string {
  return splitMath(text)
    .map(seg => (seg.math ? seg.content : convertPlain(seg.content)))
    .join("");
}
