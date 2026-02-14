import TurndownService from "turndown";
import { marked } from "marked";

export function convertHTMLToMarkdown(html: string): string {
    const turndownService = new TurndownService();
    return turndownService.turndown(html);
}

export function convertMarkdownToHTML(markdown: string): string {
    const html = marked(markdown) as string;
    return html;
}