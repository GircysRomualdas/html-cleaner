import TurndownService from "turndown";
import { marked } from "marked";
import { gfm } from "turndown-plugin-gfm";

const turndownService = new TurndownService();

turndownService.use(gfm);

export function convertHTMLToMarkdown(html: string): string {
  return turndownService.turndown(html);
}

export async function convertMarkdownToHTML(markdown: string): Promise<string> {
  return await marked(markdown);
}
