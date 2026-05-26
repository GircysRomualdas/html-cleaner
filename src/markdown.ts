import TurndownService from "turndown";
import { marked } from "marked";
import { gfm } from "turndown-plugin-gfm";

const turndownService = new TurndownService();
turndownService.use(gfm);

turndownService.addRule("inlineCode", {
  filter: (node) =>
    node.nodeName === "CODE" && node.parentNode?.nodeName !== "PRE",
  replacement: (content) => "`" + content + "`",
});

turndownService.addRule("fencedCodeBlock", {
  filter: (node) => node.nodeName === "PRE" && node.querySelector("code"),

  replacement: (content, node) => {
    const codeNode = node.querySelector("code")!;
    let raw = codeNode.textContent || "";

    raw = raw.replace(/\r\n/g, "\n").trim();

    if (!raw) return "";

    return `\`\`\`\n${raw}\n\`\`\``;
  },
});

export function convertHTMLToMarkdown(html: string): string {
  return turndownService.turndown(html);
}

export async function convertMarkdownToHTML(markdown: string): Promise<string> {
  return await marked(markdown);
}
