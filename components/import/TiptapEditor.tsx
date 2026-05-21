"use client";
import { useEffect, useRef } from "react";
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
}

const QUICK_MATH: { label: string; snippet: string; title: string }[] = [
  { label: "𝑥²", snippet: "$x^{2}$", title: "Mũ" },
  { label: "½", snippet: "$\\frac{1}{2}$", title: "Phân số" },
  { label: "√", snippet: "$\\sqrt{x}$", title: "Căn bậc hai" },
  { label: "π", snippet: "$\\pi$", title: "Pi" },
  { label: "≤", snippet: "$\\leq$", title: "Nhỏ hơn hoặc bằng" },
  { label: "≥", snippet: "$\\geq$", title: "Lớn hơn hoặc bằng" },
];

export default function TiptapEditor({ value, onChange, placeholder, minHeight = "72px" }: Props) {
  const syncing = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? "Nhập nội dung..." }),
    ],
    content: value,
    immediatelyRender: false,
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

  return (
    <div>
      {/* Math toolbar */}
      <div className="flex flex-wrap items-center gap-1 mb-1.5">
        <span className="text-[10px] font-semibold text-gray-400 mr-1">Chèn toán:</span>
        {QUICK_MATH.map((m) => (
          <button
            key={m.snippet}
            type="button"
            title={`${m.title} — ${m.snippet}`}
            onMouseDown={(e) => {
              e.preventDefault();
              insertSnippet(m.snippet);
            }}
            className="text-xs font-semibold w-7 h-7 rounded-md border border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center"
          >
            {m.label}
          </button>
        ))}
        <button
          type="button"
          title="Chèn $...$ rỗng"
          onMouseDown={(e) => {
            e.preventDefault();
            insertSnippet("$$");
            if (editor && !editor.isDestroyed) {
              editor.chain().focus().setTextSelection(editor.state.selection.from - 1).run();
            }
          }}
          className="text-[11px] font-bold px-2 h-7 rounded-md border border-gray-200 bg-white text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          $…$
        </button>
      </div>

      <div
        className="tiptap-editor border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-300 bg-white"
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
      </div>

      {value.trim() && (
        <div className="mt-1.5 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100 text-sm flex items-start gap-2">
          <span className="text-xs text-blue-400 font-semibold shrink-0 mt-0.5">Preview</span>
          <MathText text={value} className="text-gray-800" />
        </div>
      )}
    </div>
  );
}
