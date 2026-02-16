import { EditorView } from "codemirror";
import { convertHTMLToMarkdown, convertMarkdownToHTML } from "./markdown";
import { setEditorContent } from "./editors";
import { compressHTML, formatHTML } from "./formatters";
import { cleanHTML } from "./cleaner";
import { showNotification } from "./utils";

export async function handleConvertHTMLToMarkdown(
  cleanHTMLEditor: EditorView,
  markdownEditor: EditorView,
  previewFrameMarkdown: HTMLIFrameElement,
): Promise<void> {
  try {
    const cleanHTML = cleanHTMLEditor.state.doc.toString();
    if (cleanHTML.trim() === "") {
      showNotification("clean HTML is empty", "warning");
      return;
    }

    const markdown = convertHTMLToMarkdown(cleanHTML);

    await updateMarkdown(markdown, markdownEditor, previewFrameMarkdown);
    showNotification("successfully convert HTML to Markdown", "success");
  } catch (error) {
    showNotification("Faild to convert HTML to markdown", "error");
  }
}

export function handleFormatHTML(
  cleanHTMLEditor: EditorView,
  previewFrameHTML: HTMLIFrameElement,
): void {
  try {
    const currentHTML = cleanHTMLEditor.state.doc.toString();
    if (currentHTML.trim() === "") {
      showNotification("clean HTML is empty", "warning");
      return;
    }
    updateCleanHTML(formatHTML(currentHTML), cleanHTMLEditor, previewFrameHTML);
    showNotification("successfully format HTML", "success");
  } catch (error) {
    showNotification("Faild to format HTML", "error");
  }
}

export function handleCompressHTML(
  cleanHTMLEditor: EditorView,
  previewFrameHTML: HTMLIFrameElement,
): void {
  try {
    const currentHTML = cleanHTMLEditor.state.doc.toString();
    if (currentHTML.trim() === "") {
      showNotification("clean HTML is empty", "warning");
      return;
    }
    updateCleanHTML(
      compressHTML(currentHTML),
      cleanHTMLEditor,
      previewFrameHTML,
    );
    showNotification("successfully compressed HTML", "success");
  } catch (error) {
    showNotification("Faild to compress HTML", "error");
  }
}

export function handlePurifyRawHTML(
  rawHTMLEditor: EditorView,
  cleanHTMLEditor: EditorView,
  previewFrameHTML: HTMLIFrameElement,
): void {
  try {
    const html = rawHTMLEditor.state.doc.toString();
    if (html.trim() === "") {
      showNotification("raw HTML is empty", "warning");
      return;
    }
    const cleanedHTML = cleanHTML(html);
    updateCleanHTML(cleanedHTML, cleanHTMLEditor, previewFrameHTML);
    showNotification("HTML cleaned up", "success");
  } catch (error) {
    showNotification("Faild to clean HTML", "error");
  }
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
  localStorage.setItem("clean-HTML", html);
  previewFrameHTML.srcdoc = html;
}

export async function updatePreviewMarkdown(
  markdown: string,
  previewFrameMarkdown: HTMLIFrameElement,
): Promise<void> {
  localStorage.setItem("markdown", markdown);
  const html = await convertMarkdownToHTML(markdown);
  previewFrameMarkdown.srcdoc = html;
}
