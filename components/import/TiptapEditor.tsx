"use client";
import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import MathText from "@/components/MathText";

interface Props {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function TiptapEditor({ value, onChange, placeholder, minHeight = "72px" }: Props) {
  const syncing = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? "Nhập nội dung..." }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (!syncing.current) {
        onChange(editor.getText({ blockSeparator: "\n" }));
      }
    },
  });

  // sync khi value thay đổi từ bên ngoài (vd: paste import)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const current = editor.getText({ blockSeparator: "\n" });
    if (current !== value) {
      syncing.current = true;
      editor.commands.setContent(value);
      syncing.current = false;
    }
  }, [value, editor]);

  return (
    <div>
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
