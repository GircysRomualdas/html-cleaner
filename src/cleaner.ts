import { formatHTML, compressHTML } from "./formatters";

export function cleanHTML(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    removeAttributes(doc);
    removeUselessElements(doc);
    removeEmptyElements(doc);

    return formatHTML(compressHTML(doc.body.innerHTML));
}

function removeAttributes(doc: HTMLDocument): void {
    const elements = doc.querySelectorAll("*");
    const protectedAttributes = new Set(["href", "src", "alt", "title"]);

    for (const element of elements) {
        for (const attribute of Array.from(element.attributes)) {
            if (protectedAttributes.has(attribute.name)) {
                continue;
            }
            element.removeAttribute(attribute.name);
        }
    }
}

function removeEmptyElements(doc: HTMLDocument): void {
    const elements = Array.from(doc.querySelectorAll("*")).reverse();
    const voidTags = new Set(["IMG", "BR", "HR", "INPUT"]);

    for (const element of elements) {
        if (voidTags.has(element.tagName)) {
            continue;
        }
        if (element.textContent?.trim() === "" && element.children.length === 0) {
            element.remove();
        }
    }
}

function removeUselessElements(doc: HTMLDocument): void {
    const uselessTags = [
        "script", "style", "nav", "meta", "link", "base", "title", 
        "noscript", "template", "iframe", "object", "embed", "param", 
        "track", "colgroup", "col", "datalist", "head"
    ];
    const elements = doc.querySelectorAll(uselessTags.join(","));

    for (const element of elements) {
        element.remove();
    }
}