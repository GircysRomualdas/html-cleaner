import TurndownService from "turndown";
import { marked } from "marked";

const turndownService = new TurndownService();

export function convertHTMLToMarkdown(html: string): string {
    return turndownService.turndown(html);
}

export async function convertMarkdownToHTML(markdown: string): Promise<string> {
    return await marked(markdown);
}