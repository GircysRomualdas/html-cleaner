import { compressHTML } from "./formatters";

export function cleanHTML(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    removeAttributes(doc);
    removeUselessElements(doc);
    removeEmptyElements(doc);

    return compressHTML(doc.body.innerHTML);
}

function removeAttributes(doc: HTMLDocument): void {
    const elements = doc.querySelectorAll("*");

    elements.forEach((element) => {
        Array.from(element.attributes).forEach((attribute) => {
            element.removeAttribute(attribute.name);
        });
    });
}

function removeEmptyElements(doc: HTMLDocument): void {
    const elements = doc.querySelectorAll("*");

    elements.forEach((element) => {
        if (element.textContent?.trim() === "") {
            element.remove();
        }
    });
}

function removeUselessElements(doc: HTMLDocument): void {
    const uselessTags = [
        "script", "style", "nav", "meta", "link", "base", "title", 
        "noscript", "template", "iframe", "object", "embed", "param", 
        "track", "colgroup", "col", "datalist", "head"
    ];
    const elements = doc.querySelectorAll(uselessTags.join(","));

    elements.forEach((element) => {
        element.remove();
    });
}