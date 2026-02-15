import { EditorView, basicSetup } from "codemirror";
import { html } from "@codemirror/lang-html";
import { markdown } from "@codemirror/lang-markdown";

export function createHTMLEditor(
  parent: HTMLElement,
  onChange?: (content: string) => void,
): EditorView {
  return new EditorView({
    doc: "",
    extensions: [
      basicSetup,
      html(),
      EditorView.lineWrapping,
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onChange) {
          onChange(update.state.doc.toString());
        }
      }),
    ],
    parent,
  });
}

export function createMarkdownEditor(
  parent: HTMLElement,
  onChange?: (content: string) => void,
): EditorView {
  return new EditorView({
    doc: "",
    extensions: [
      basicSetup,
      markdown(),
      EditorView.lineWrapping,
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onChange) {
          onChange(update.state.doc.toString());
        }
      }),
    ],
    parent,
  });
}

export function setEditorContent(editor: EditorView, content: string): void {
  editor.dispatch({
    changes: {
      from: 0,
      to: editor.state.doc.length,
      insert: content,
    },
  });
}
