import {
  createHTMLEditor,
  createMarkdownEditor,
  clearEditor,
  setEditorContent,
} from "./editors";
import { copyToClipboard, toggleTheme, loadTheme, getElement } from "./utils";
import {
  handleConvertHTMLToMarkdown,
  handleFormatHTML,
  handleCompressHTML,
  handlePurifyRawHTML,
  updatePreviewHTML,
  updatePreviewMarkdown,
  updateCleanHTML,
  updateMarkdown,
} from "./handlers";

// Frames
const previewFrameHTML = getElement<HTMLIFrameElement>("iframe-preview-html");

const previewFrameMarkdown = getElement<HTMLIFrameElement>(
  "iframe-preview-markdown",
);

// Editors
const rawHTMLEditor = createHTMLEditor(
  getElement<HTMLDivElement>("editor-raw-html"),
  (content) => {
    localStorage.setItem("raw-HTML", content);
  },
);

const cleanHTMLEditor = createHTMLEditor(
  getElement<HTMLDivElement>("editor-clean-html"),
  (content) => {
    updatePreviewHTML(content, previewFrameHTML);
  },
);

const markdownEditor = createMarkdownEditor(
  getElement<HTMLDivElement>("editor-markdown"),
  async (content) => {
    await updatePreviewMarkdown(content, previewFrameMarkdown);
  },
);

// local storage editors
const storageRawHTML = localStorage.getItem("raw-HTML") ?? "";
setEditorContent(rawHTMLEditor, storageRawHTML);

const storageCleanHTML = localStorage.getItem("clean-HTML") ?? "";
updateCleanHTML(storageCleanHTML, cleanHTMLEditor, previewFrameHTML);

const storageMarkdown = localStorage.getItem("markdown") ?? "";
updateMarkdown(storageMarkdown, markdownEditor, previewFrameMarkdown);

// Action buttons
getElement<HTMLButtonElement>("btn-clean").addEventListener("click", () => {
  handlePurifyRawHTML(rawHTMLEditor, cleanHTMLEditor, previewFrameHTML);
});

getElement<HTMLButtonElement>("btn-markdown").addEventListener("click", () => {
  handleConvertHTMLToMarkdown(
    cleanHTMLEditor,
    markdownEditor,
    previewFrameMarkdown,
  );
});

getElement<HTMLButtonElement>("btn-format").addEventListener("click", () => {
  handleFormatHTML(cleanHTMLEditor, previewFrameHTML);
});

getElement<HTMLButtonElement>("btn-compress").addEventListener("click", () => {
  handleCompressHTML(cleanHTMLEditor, previewFrameHTML);
});

// Copy buttons
const copyButtons = [
  { id: "btn-copy-html-raw", editor: rawHTMLEditor },
  { id: "btn-copy-html-clean", editor: cleanHTMLEditor },
  { id: "btn-copy-markdown", editor: markdownEditor },
];

for (const { id, editor } of copyButtons) {
  const btn = getElement<HTMLButtonElement>(id);
  btn.addEventListener("click", async () => {
    await copyToClipboard(editor.state.doc.toString(), btn);
  });
}

// Clear buttons
getElement<HTMLButtonElement>("btn-clear-html-raw").addEventListener(
  "click",
  () => {
    clearEditor(rawHTMLEditor);
  },
);

getElement<HTMLButtonElement>("btn-clear-html-clean").addEventListener(
  "click",
  () => {
    clearEditor(cleanHTMLEditor);
    updatePreviewHTML("", previewFrameHTML);
  },
);

getElement<HTMLButtonElement>("btn-clear-markdown").addEventListener(
  "click",
  async () => {
    clearEditor(markdownEditor);
    await updatePreviewMarkdown("", previewFrameMarkdown);
  },
);

// Theme toggle
const btnToggleTheme = getElement<HTMLButtonElement>("btn-toggle-theme");
btnToggleTheme.addEventListener("click", () => {
  toggleTheme(btnToggleTheme);
});
loadTheme(btnToggleTheme);
