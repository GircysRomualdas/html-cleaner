import { html as beautifyHTML } from "js-beautify";

export function compressHTML(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const codeBlocks: string[] = [];
  const codeElements = doc.querySelectorAll("pre, code");
  let i = 0;
  for (const el of codeElements) {
    codeBlocks[i] = el.innerHTML;
    el.innerHTML = `__CODE_BLOCK_${i}__`;
    i++;
  }

  const regexRemoveLineBreaks = /\n/g;
  const regexCollapseSpaces = /\s{2,}/g;
  const regexRemoveSpacesBetweenTags = />\s+</g;

  let compressed = doc.body.innerHTML
    .replace(regexRemoveLineBreaks, "")
    .replace(regexCollapseSpaces, " ")
    .replace(regexRemoveSpacesBetweenTags, "><")
    .trim();

  for (let j = 0; j < codeBlocks.length; j++) {
    compressed = compressed.replace(`__CODE_BLOCK_${j}__`, codeBlocks[j] ?? "");
  }

  return compressed;
}

export function formatHTML(html: string): string {
  return beautifyHTML(html, {
    indent_size: 2,
  });
}
