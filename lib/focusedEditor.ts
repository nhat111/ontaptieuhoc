import type { Editor } from "@tiptap/react";

let current: Editor | null = null;

export function setFocusedEditor(editor: Editor | null) {
  current = editor;
}

export function clearFocusedEditor(editor: Editor) {
  if (current === editor) current = null;
}

export function insertIntoFocused(text: string): boolean {
  if (!current || current.isDestroyed) return false;
  current.chain().focus().insertContent(text).run();
  return true;
}
