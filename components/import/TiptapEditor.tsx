"use client";
import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import MathText from "@/components/MathText";
import { setFocusedEditor, clearFocusedEditor } from "@/lib/focusedEditor";

interface Props {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  minHeight?: string;
  /**
   * Chặn được cú dán để tự xử lý. Trả `true` nghĩa là đã xử lý xong, trình soạn
   * không chèn text nữa.
   */
  onPasteText?: (text: string) => boolean;
}

/** Ký hiệu chèn thẳng dạng chữ thường — không cần công thức, đọc được ở mọi nơi. */
const SYMBOLS: { label: string; text: string; title: string }[] = [
  { label: "×", text: "×", title: "Dấu nhân" },
  { label: ":", text: ":", title: "Dấu chia" },
  { label: "≤", text: "≤", title: "Bé hơn hoặc bằng" },
  { label: "≥", text: "≥", title: "Lớn hơn hoặc bằng" },
  { label: "°", text: "°", title: "Độ" },
  { label: "π", text: "π", title: "Pi" },
];

/**
 * Công thức cần dựng bằng LaTeX — người soạn chỉ điền các ô (tử số, mẫu số…),
 * mã `$\frac{…}{…}$` do máy viết. Trước đây nút "½" chèn nguyên văn
 * `$\frac{1}{2}$` vào ô, cô giáo phải tự sửa số trong đống mã đó.
 */
type FormulaKind = "frac" | "pow" | "sqrt";
const FORMULAS: Record<FormulaKind, { button: string; title: string; fields: string[]; build: (v: string[]) => string }> = {
  frac: { button: "Phân số", title: "Phân số", fields: ["Tử số", "Mẫu số"], build: ([a, b]) => `$\\frac{${a}}{${b}}$` },
  pow: { button: "Số mũ", title: "Luỹ thừa (số mũ)", fields: ["Cơ số", "Số mũ"], build: ([a, b]) => `$${a}^{${b}}$` },
  sqrt: { button: "Căn", title: "Căn bậc hai", fields: ["Số dưới căn"], build: ([a]) => `$\\sqrt{${a}}$` },
};

/** Ô có công thức thì mới cần dòng "Xem trước" — chữ thường thì ô soạn đã là chính nó. */
export const hasMath = (s: string) => /\$|\\\(|\\\[/.test(s);

export default function TiptapEditor({
  value,
  onChange,
  placeholder,
  minHeight = "72px",
  onPasteText,
}: Props) {
  const syncing = useRef(false);
  // Giữ trong ref để `handlePaste` (tạo một lần lúc khởi tạo editor) luôn gọi
  // bản mới nhất, thay vì đóng băng bản đầu tiên.
  const pasteRef = useRef(onPasteText);
  useEffect(() => {
    pasteRef.current = onPasteText;
  }, [onPasteText]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? "Nhập nội dung..." }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      handlePaste: (_view, event) => {
        const text = event.clipboardData?.getData("text/plain");
        if (!text || !pasteRef.current) return false;
        return pasteRef.current(text);
      },
    },
    onFocus: ({ editor }) => setFocusedEditor(editor),
    onUpdate: ({ editor }) => {
      if (!syncing.current) {
        onChange(editor.getText({ blockSeparator: "\n" }));
      }
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const current = editor.getText({ blockSeparator: "\n" });
    if (current !== value) {
      syncing.current = true;
      editor.commands.setContent(value);
      syncing.current = false;
    }
  }, [value, editor]);

  useEffect(() => {
    return () => { if (editor) clearFocusedEditor(editor); };
  }, [editor]);

  function insertSnippet(snippet: string) {
    if (!editor || editor.isDestroyed) return;
    editor.chain().focus().insertContent(snippet).run();
  }

  const [formula, setFormula] = useState<FormulaKind | null>(null);
  const [fields, setFields] = useState<string[]>([]);
  const openFormula = (k: FormulaKind) => {
    setFormula((cur) => (cur === k ? null : k));
    setFields(FORMULAS[k].fields.map(() => ""));
  };
  const insertFormula = () => {
    if (!formula || fields.some((f) => !f.trim())) return;
    insertSnippet(FORMULAS[formula].build(fields.map((f) => f.trim())));
    setFormula(null);
  };

  const toolBtn =
    "h-9 min-w-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-colors";

  return (
    <div>
      {/* Thanh chèn: ký hiệu chữ thường + công thức điền ô */}
      <div className="mb-1.5 flex flex-wrap items-center gap-1">
        {SYMBOLS.map((m) => (
          <button
            key={m.label}
            type="button"
            title={m.title}
            onMouseDown={(e) => {
              e.preventDefault(); // giữ con trỏ trong ô soạn
              insertSnippet(m.text);
            }}
            className={toolBtn}
          >
            {m.label}
          </button>
        ))}
        {(Object.keys(FORMULAS) as FormulaKind[]).map((k) => (
          <button
            key={k}
            type="button"
            title={FORMULAS[k].title}
            onMouseDown={(e) => { e.preventDefault(); openFormula(k); }}
            className={`${toolBtn} ${formula === k ? "border-primary-500 bg-primary-50 text-primary-700" : ""}`}
          >
            {FORMULAS[k].button}
          </button>
        ))}
      </div>

      {formula && (
        <div className="mb-2 flex flex-wrap items-end gap-2 rounded-xl border border-primary-100 bg-primary-50/60 p-2.5">
          {FORMULAS[formula].fields.map((label, i) => (
            <label key={label} className="text-xs font-semibold text-slate-600">
              {label}
              <input
                autoFocus={i === 0}
                value={fields[i] ?? ""}
                onChange={(e) => setFields((f) => f.map((x, j) => (j === i ? e.target.value : x)))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); insertFormula(); }
                  if (e.key === "Escape") setFormula(null);
                }}
                className="mt-1 block w-24 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-base font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-300 sm:text-sm"
              />
            </label>
          ))}
          {fields.every((f) => f.trim()) && (
            <span className="pb-1.5 text-base text-slate-800">
              <MathText text={FORMULAS[formula].build(fields.map((f) => f.trim()))} />
            </span>
          )}
          <button
            type="button"
            onClick={insertFormula}
            disabled={fields.some((f) => !f.trim())}
            className="h-9 rounded-lg bg-primary-600 px-3 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-40"
          >
            Chèn
          </button>
          <button type="button" onClick={() => setFormula(null)} className="h-9 px-2 text-sm text-slate-500 hover:text-slate-700">
            Huỷ
          </button>
        </div>
      )}

      <div
        className="tiptap-editor border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-300 bg-white"
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
      </div>

      {hasMath(value) && (
        <div className="mt-1.5 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100 text-sm flex items-start gap-2">
          <span className="text-xs text-blue-500 font-semibold shrink-0 mt-0.5">Học sinh sẽ thấy</span>
          <MathText text={value} className="text-gray-800" />
        </div>
      )}
    </div>
  );
}
