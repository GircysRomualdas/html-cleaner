import { createHTMLEditor, createMarkdownEditor, clearEditor } from "./editors";
import { copyToClipboard, toggleTheme, loadTheme, getElement } from "./utils";
import {
  handleConvertHTMLToMarkdown,
  handleFormatHTML,
  handleCompressHTML,
  handlePurifyRawHTML,
  updatePreviewHTML,
  updatePreviewMarkdown,
} from "./handlers";

// Editors
const rawHTMLEditor = createHTMLEditor(
  getElement<HTMLDivElement>("editor-raw-html"),
);

const cleanHTMLEditor = createHTMLEditor(
  getElement<HTMLDivElement>("editor-clean-html"),
  (content) => {
    updatePreviewHTML(content);
  },
);

const markdownEditor = createMarkdownEditor(
  getElement<HTMLDivElement>("editor-markdown"),
  async (content) => {
    await updatePreviewMarkdown(content);
  },
);

// Action buttons
getElement<HTMLButtonElement>("btn-clean").addEventListener("click", () => {
  handlePurifyRawHTML(rawHTMLEditor, cleanHTMLEditor);
});

getElement<HTMLButtonElement>("btn-markdown").addEventListener("click", () => {
  handleConvertHTMLToMarkdown(cleanHTMLEditor, markdownEditor);
});

getElement<HTMLButtonElement>("btn-format").addEventListener("click", () => {
  handleFormatHTML(cleanHTMLEditor);
});

getElement<HTMLButtonElement>("btn-compress").addEventListener("click", () => {
  handleCompressHTML(cleanHTMLEditor);
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
    updatePreviewHTML("");
  },
);

getElement<HTMLButtonElement>("btn-clear-markdown").addEventListener(
  "click",
  async () => {
    clearEditor(markdownEditor);
    await updatePreviewMarkdown("");
  },
);

// Theme toggle
const btnToggleTheme = getElement<HTMLButtonElement>("btn-toggle-theme");
btnToggleTheme.addEventListener("click", () => {
  toggleTheme(btnToggleTheme);
});
loadTheme(btnToggleTheme);
