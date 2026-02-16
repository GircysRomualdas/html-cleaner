import { EditorView } from "codemirror";
import { convertHTMLToMarkdown, convertMarkdownToHTML } from "./markdown";
import { setEditorContent } from "./editors";
import { compressHTML, formatHTML } from "./formatters";
import { cleanHTML } from "./cleaner";

export async function handleConvertHTMLToMarkdown(
  cleanHTMLEditor: EditorView,
  markdownEditor: EditorView,
): Promise<void> {
  const cleanHTML = cleanHTMLEditor.state.doc.toString();
  const markdown = convertHTMLToMarkdown(cleanHTML);
  setEditorContent(markdownEditor, markdown);
  await updatePreviewMarkdown(markdown);
}

export function handleFormatHTML(cleanHTMLEditor: EditorView): void {
  const currentHTML = cleanHTMLEditor.state.doc.toString();
  updateOutputHTML(formatHTML(currentHTML), cleanHTMLEditor);
}

export function handleCompressHTML(cleanHTMLEditor: EditorView): void {
  const currentHTML = cleanHTMLEditor.state.doc.toString();
  updateOutputHTML(compressHTML(currentHTML), cleanHTMLEditor);
}

export function handlePurifyRawHTML(
  rawHTMLEditor: EditorView,
  cleanHTMLEditor: EditorView,
): void {
  const value = rawHTMLEditor.state.doc.toString();
  const cleanedHTML = cleanHTML(value);
  updateOutputHTML(cleanedHTML, cleanHTMLEditor);
}

// updates
function updateOutputHTML(
  htmlString: string,
  cleanHTMLEditor: EditorView,
): void {
  setEditorContent(cleanHTMLEditor, htmlString);
  updatePreviewHTML(htmlString);
}

export function updatePreviewHTML(htmlString: string): void {
  const previewHTMLFrame = document.getElementById(
    "iframe-preview-html",
  ) as HTMLIFrameElement | null;
  if (!previewHTMLFrame) {
    console.error("Missing element");
    return;
  }
  previewHTMLFrame.srcdoc = htmlString;
}

export async function updatePreviewMarkdown(
  markdownString: string,
): Promise<void> {
  const previewMarkdownFrame = document.getElementById(
    "iframe-preview-markdown",
  ) as HTMLIFrameElement | null;
  if (!previewMarkdownFrame) {
    console.error("Missing element");
    return;
  }
  const html = await convertMarkdownToHTML(markdownString);
  previewMarkdownFrame.srcdoc = html;
}
