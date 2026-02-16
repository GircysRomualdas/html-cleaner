import { html as beautifyHTML } from "js-beautify";

type ExtractedCodeBlocks = {
  html: string;
  codeBlocks: string[];
};

export function compressHTML(html: string): string {
  const { html: withoutCode, codeBlocks } = extractCodeBlocks(html);

  const compressed = withoutCode
    .replace(/\n/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/>\s+</g, "><")
    .trim();

  return restoreCodeBlocks(compressed, codeBlocks);
}

function extractCodeBlocks(html: string): ExtractedCodeBlocks {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const codeBlocks: string[] = [];
  const codeElements = doc.querySelectorAll("pre, code");

  codeElements.forEach((el, index) => {
    codeBlocks[index] = el.innerHTML;
    el.innerHTML = `__CODE_BLOCK_${index}__`;
  });

  return {
    html: doc.body.innerHTML,
    codeBlocks,
  };
}

function restoreCodeBlocks(html: string, codeBlocks: string[]): string {
  let restored = html;

  codeBlocks.forEach((code, index) => {
    restored = restored.replace(`__CODE_BLOCK_${index}__`, code ?? "");
  });

  return restored;
}

export function formatHTML(html: string): string {
  return beautifyHTML(html, {
    indent_size: 2,
  });
}
