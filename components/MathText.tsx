"use client";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathTextProps {
  text: string;
  className?: string;
}

// Renders a string that may contain $...$ inline LaTeX, \(...\), or \[...\] blocks.
export default function MathText({ text, className }: MathTextProps) {
  const parts = renderParts(text);
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: parts }}
    />
  );
}

function renderParts(text: string): string {
  // $$...$$ (block) must come before $...$ (inline) in the alternation
  const re = /(\$\$[\s\S]+?\$\$|\$[^$\n]+\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\])/g;
  let result = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) result += escapeHtml(text.slice(last, m.index));
    const raw = m[0];
    const isDisplay = raw.startsWith("\\[") || raw.startsWith("$$");
    const inner = raw
      .replace(/^\$\$|\$\$$/g, "")
      .replace(/^\$|\$$/g, "")
      .replace(/^\\\(|\\\)$/g, "")
      .replace(/^\\\[|\\\]$/g, "");
    try {
      result += katex.renderToString(inner, { displayMode: isDisplay, throwOnError: false });
    } catch {
      result += escapeHtml(raw);
    }
    last = m.index + raw.length;
  }
  if (last < text.length) result += escapeHtml(text.slice(last));
  return result;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
