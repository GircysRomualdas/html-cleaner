import { cleanHTML } from "./cleaner";
import { compressHTML } from "./formatters";
import { convertHTMLToMarkdown, convertMarkdownToHTML } from "./markdown";


const btnClean = document.getElementById("btn-clean");
btnClean?.addEventListener("click", handlePurifyRawHTML);

const btnMarkdown = document.getElementById("btn-markdown");
btnMarkdown?.addEventListener("click", handleConvertHTMLToMarkdown);

const btnFormat = document.getElementById("btn-format");
btnFormat?.addEventListener("click", handleFormatHTML);

const btnCompress = document.getElementById("btn-compress");
btnCompress?.addEventListener("click", handleCompressHTML);

const textareaMarkdown = document.getElementById("textarea-markdown") as HTMLTextAreaElement | null;
textareaMarkdown?.addEventListener("input", () => { updatePreviewMarkdown(textareaMarkdown); });

const textareaCleanHTML = document.getElementById("textarea-clean-html") as HTMLTextAreaElement | null;
textareaCleanHTML?.addEventListener("input", () => { updatePreviewHTML(textareaCleanHTML); });


function updatePreviewHTML(cleanHTMLArea: HTMLTextAreaElement): void {
    const previewHTMLFrame = document.getElementById("iframe-preview-html") as HTMLIFrameElement | null;
    if (!previewHTMLFrame) {
        console.error("Missing element");
        return;
    } 
    previewHTMLFrame.srcdoc = cleanHTMLArea.value;
}

function updatePreviewMarkdown(markdownArea: HTMLTextAreaElement): void {
    const previewMarkdownFrame = document.getElementById("iframe-preview-markdown") as HTMLIFrameElement | null;
    if (!previewMarkdownFrame) {
        console.error("Missing element");
        return;
    } 

    const html = convertMarkdownToHTML(markdownArea.value);
    previewMarkdownFrame.srcdoc = html;
}

function handleConvertHTMLToMarkdown(): void {
    const markdownArea = document.getElementById("textarea-markdown") as HTMLTextAreaElement | null;
    const cleanHTMLArea = document.getElementById("textarea-clean-html") as HTMLTextAreaElement | null;
    if (!markdownArea || !cleanHTMLArea) {
        console.error("Missing element");
        return;
    } 

    markdownArea.value = convertHTMLToMarkdown(cleanHTMLArea.value); 
    updatePreviewMarkdown(markdownArea);
}

function updateOutputHTML(htmlString: string): void {
    const previewHTMLFrame = document.getElementById("iframe-preview-html") as HTMLIFrameElement | null;
    const cleanHTMLArea = document.getElementById("textarea-clean-html") as HTMLTextAreaElement | null;
    if (!previewHTMLFrame || !cleanHTMLArea) {
        console.error("Missing element");
        return;
    } 
    cleanHTMLArea.value = htmlString;
    previewHTMLFrame.srcdoc = cleanHTMLArea.value;
}


function handleFormatHTML() {
    const cleanHTMLArea = document.getElementById("textarea-clean-html") as HTMLTextAreaElement | null;
    if (!cleanHTMLArea) {
        console.error("Missing element");
        return;
    } 

    const div = document.createElement("div");
    div.innerHTML = cleanHTMLArea.value;
    let formatted = div.innerHTML;
    formatted = formatted.replace(/></g, '>\n<');
    updateOutputHTML(formatted);
}


function handleCompressHTML() {
    const cleanHTMLArea = document.getElementById("textarea-clean-html") as HTMLTextAreaElement | null;
    if (!cleanHTMLArea) {
        console.error("Missing element");
        return;
    } 

    updateOutputHTML(compressHTML(cleanHTMLArea.value));
}

function handlePurifyRawHTML() {
    const rawHTMLArea = document.getElementById("textarea-raw-html") as HTMLTextAreaElement | null;
    if (!rawHTMLArea) {
        console.error("Missing element");
        return;
    } 

    const cleanedHTML = cleanHTML(rawHTMLArea.value);
    updateOutputHTML(cleanedHTML);
}