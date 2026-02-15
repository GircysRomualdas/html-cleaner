import { cleanHTML } from "./cleaner";
import { compressHTML, formatHTML } from "./formatters";
import { convertHTMLToMarkdown, convertMarkdownToHTML } from "./markdown";
import {
  createHTMLEditor,
  setEditorContent,
  createMarkdownEditor,
} from "./editors";

const rawHTMLContainer = document.getElementById("editor-raw-html");
if (!rawHTMLContainer) {
  throw new Error("Missing container");
}
const rawHTMLEditor = createHTMLEditor(rawHTMLContainer);

const cleanHTMLContainer = document.getElementById("editor-clean-html");
if (!cleanHTMLContainer) {
  throw new Error("Missing container");
}
const cleanHTMLEditor = createHTMLEditor(cleanHTMLContainer, (content) => {
  updatePreviewHTML(content);
});

const markdownContainer = document.getElementById("editor-markdown");
if (!markdownContainer) {
  throw new Error("Missing container");
}
const markdownEditor = createMarkdownEditor(
  markdownContainer,
  async (content) => {
    await updatePreviewMarkdown(content);
  },
);

const btnClean = document.getElementById("btn-clean");
btnClean?.addEventListener("click", handlePurifyRawHTML);

const btnMarkdown = document.getElementById("btn-markdown");
btnMarkdown?.addEventListener("click", handleConvertHTMLToMarkdown);

const btnFormat = document.getElementById("btn-format");
btnFormat?.addEventListener("click", handleFormatHTML);

const btnCompress = document.getElementById("btn-compress");
btnCompress?.addEventListener("click", handleCompressHTML);

function updatePreviewHTML(htmlString: string): void {
  const previewHTMLFrame = document.getElementById(
    "iframe-preview-html",
  ) as HTMLIFrameElement | null;
  if (!previewHTMLFrame) {
    console.error("Missing element");
    return;
  }
  previewHTMLFrame.srcdoc = htmlString;
}

async function updatePreviewMarkdown(markdownString: string): Promise<void> {
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

async function handleConvertHTMLToMarkdown(): Promise<void> {
  const cleanHTML = cleanHTMLEditor.state.doc.toString();
  const markdown = convertHTMLToMarkdown(cleanHTML);
  setEditorContent(markdownEditor, markdown);
  await updatePreviewMarkdown(markdown);
}

function updateOutputHTML(htmlString: string): void {
  setEditorContent(cleanHTMLEditor, htmlString);
  updatePreviewHTML(htmlString);
}

function handleFormatHTML(): void {
  const currentHTML = cleanHTMLEditor.state.doc.toString();
  updateOutputHTML(formatHTML(currentHTML));
}

function handleCompressHTML(): void {
  const currentHTML = cleanHTMLEditor.state.doc.toString();
  updateOutputHTML(compressHTML(currentHTML));
}

function handlePurifyRawHTML(): void {
  const value = rawHTMLEditor.state.doc.toString();
  const cleanedHTML = cleanHTML(value);
  updateOutputHTML(cleanedHTML);
}
