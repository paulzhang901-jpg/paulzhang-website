import type {ContentLanguage} from "@/types/content";

export function sermonDisplayText(value: string, locale: ContentLanguage) {
  return value.replace(/-{3,}/g, locale === "zh-CN" ? "——" : "—");
}

export function sameSermonDisplayText(a: string, b: string, locale: ContentLanguage) {
  const normalize = (value: string) => sermonDisplayText(value, locale).replace(/\s+/g, " ").trim();
  return normalize(a) === normalize(b);
}

type DisplayNode = {type: string; depth?: number; value?: string; children?: DisplayNode[]};

export function sermonDisplayMarkdown(body: string, locale: ContentLanguage) {
  if (locale !== "zh-CN" || !/\\#{2,6}\s/.test(body)) return body;
  // Imported escaped heading markers are a presentation convention. Keep code
  // fences intact and leave the authoritative string/file untouched.
  return body.split(/(^```[^\n]*\n[\s\S]*?^```[^\n]*$)/m).map((part) => {
    if (part.startsWith("```")) return part;
    const lines = part.replace(/\u2028/g, "\n").replace(/[ \t]*\\(#{2,6})(?:[ \t]*\n[ \t]*|[ \t]+)/g, "\n\n$1 ").split("\n");
    const plain = (line: string) => line.trim() && !/^\s*(?:#|>|[-*+]\s|\d+[.)]\s|```|\|)/.test(line);
    return lines.map((line, index) => line + (plain(line) && plain(lines[index + 1] ?? "") ? "\n" : "")).join("\n");
  }).join("");
}

// Transform only the disposable Markdown rendering tree, never source bytes.
export function sermonPresentationPlugin({title, locale}: {title: string; locale: ContentLanguage}) {
  return (tree: DisplayNode) => {
    const text = (node: DisplayNode): string => node.value ?? node.children?.map(text).join("") ?? "";
    const first = tree.children?.[0];
    if (first?.type === "heading" && first.depth === 1 && sameSermonDisplayText(text(first), title, locale)) tree.children!.shift();
    tree.children = tree.children?.filter((node) => !(node.type === "paragraph" && text(node).trim() === "Website Canonical Edition v1.0"));
    const visit = (node: DisplayNode) => {
      if (node.type === "text" && node.value) node.value = sermonDisplayText(node.value, locale);
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}
