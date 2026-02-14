import { cleanHTML } from "./cleaner";
import { compressHTML, formatHTML } from "./formatters";
import { convertHTMLToMarkdown, convertMarkdownToHTML } from "./markdown";


const btnClean = document.getElementById("btn-clean");
btnClean?.addEventListener("click", handlePurifyRawHTML);

const btnMarkdown = document.getElementById("btn-markdown");
btnMarkdown?.addEventListener("click", async () => { await handleConvertHTMLToMarkdown(); });

const btnFormat = document.getElementById("btn-format");
btnFormat?.addEventListener("click", handleFormatHTML);

const btnCompress = document.getElementById("btn-compress");
btnCompress?.addEventListener("click", handleCompressHTML);

const textareaMarkdown = document.getElementById("textarea-markdown") as HTMLTextAreaElement | null;
textareaMarkdown?.addEventListener("input", async () => { await updatePreviewMarkdown(textareaMarkdown); });

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

async function updatePreviewMarkdown(markdownArea: HTMLTextAreaElement): Promise<void> {
    const previewMarkdownFrame = document.getElementById("iframe-preview-markdown") as HTMLIFrameElement | null;
    if (!previewMarkdownFrame) {
        console.error("Missing element");
        return;
    } 

    const html = await convertMarkdownToHTML(markdownArea.value);
    previewMarkdownFrame.srcdoc = html;
}

async function handleConvertHTMLToMarkdown(): Promise<void> {
    const markdownArea = document.getElementById("textarea-markdown") as HTMLTextAreaElement | null;
    const cleanHTMLArea = document.getElementById("textarea-clean-html") as HTMLTextAreaElement | null;
    if (!markdownArea || !cleanHTMLArea) {
        console.error("Missing element");
        return;
    } 

    markdownArea.value = convertHTMLToMarkdown(cleanHTMLArea.value); 
    await updatePreviewMarkdown(markdownArea);
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

    updateOutputHTML(formatHTML(cleanHTMLArea.value));
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