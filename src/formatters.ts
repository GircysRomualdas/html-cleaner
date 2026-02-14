export function compressHTML(html: string): string {
    return html.replace(/\s{2,}/g, " ").trim();
}

export function formatHTML(html: string): string {
    return html.replace(/>\s*</g, ">\n<");
}
