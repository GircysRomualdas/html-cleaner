import { EditorView } from "codemirror";
import { convertHTMLToMarkdown, convertMarkdownToHTML } from "./markdown";
import { setEditorContent } from "./editors";
import { compressHTML, formatHTML } from "./formatters";
import { cleanHTML } from "./cleaner";

export async function handleConvertHTMLToMarkdown(
  cleanHTMLEditor: EditorView,
  markdownEditor: EditorView,
  previewFrameMarkdown: HTMLIFrameElement,
): Promise<void> {
  const cleanHTML = cleanHTMLEditor.state.doc.toString();
  const markdown = convertHTMLToMarkdown(cleanHTML);

  await updateMarkdown(markdown, markdownEditor, previewFrameMarkdown);
}

export function handleFormatHTML(
  cleanHTMLEditor: EditorView,
  previewFrameHTML: HTMLIFrameElement,
): void {
  const currentHTML = cleanHTMLEditor.state.doc.toString();
  updateCleanHTML(formatHTML(currentHTML), cleanHTMLEditor, previewFrameHTML);
}

export function handleCompressHTML(
  cleanHTMLEditor: EditorView,
  previewFrameHTML: HTMLIFrameElement,
): void {
  const currentHTML = cleanHTMLEditor.state.doc.toString();
  updateCleanHTML(compressHTML(currentHTML), cleanHTMLEditor, previewFrameHTML);
}

export function handlePurifyRawHTML(
  rawHTMLEditor: EditorView,
  cleanHTMLEditor: EditorView,
  previewFrameHTML: HTMLIFrameElement,
): void {
  const value = rawHTMLEditor.state.doc.toString();
  const cleanedHTML = cleanHTML(value);
  updateCleanHTML(cleanedHTML, cleanHTMLEditor, previewFrameHTML);
}

// updates
export async function updateMarkdown(
  markdown: string,
  markdownEditor: EditorView,
  previewFrameMarkdown: HTMLIFrameElement,
): Promise<void> {
  setEditorContent(markdownEditor, markdown);
  await updatePreviewMarkdown(markdown, previewFrameMarkdown);
}

export function updateCleanHTML(
  html: string,
  cleanHTMLEditor: EditorView,
  previewFrameHTML: HTMLIFrameElement,
): void {
  setEditorContent(cleanHTMLEditor, html);
  updatePreviewHTML(html, previewFrameHTML);
}

export function updatePreviewHTML(
  html: string,
  previewFrameHTML: HTMLIFrameElement,
): void {
  previewFrameHTML.srcdoc = html;
}

export async function updatePreviewMarkdown(
  markdown: string,
  previewFrameMarkdown: HTMLIFrameElement,
): Promise<void> {
  const html = await convertMarkdownToHTML(markdown);
  previewFrameMarkdown.srcdoc = html;
}
