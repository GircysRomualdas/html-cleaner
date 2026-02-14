export function compressHTML(html: string): string {
    const patternNewlinesTabs = /\n\s*\n/g;
    const patternSpaces = /\s+/g;
    return html.replace(patternNewlinesTabs, " ").replace(patternSpaces, " ").trim();
}

export function formatHTML(html: string): string {
    return "";
}