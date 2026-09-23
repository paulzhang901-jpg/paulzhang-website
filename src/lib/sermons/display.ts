import type {ContentLanguage} from "@/types/content";

export function sermonDisplayText(value: string, locale: ContentLanguage) {
  return value.replace(/-{3,}/g, locale === "zh-CN" ? "——" : "—");
}

export function sameSermonDisplayText(a: string, b: string, locale: ContentLanguage) {
  const normalize = (value: string) => sermonDisplayText(value, locale).replace(/\s+/g, " ").trim();
  return normalize(a) === normalize(b);
}


function normalizeSermonTitleCandidate(value: string, locale: ContentLanguage) {
  return sermonDisplayText(value.replace(/^#{1,6}\s*/, "").trim().replace(/^[《“\"‘]+|[》”\"’]+$/g, ""), locale).replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Permanent sermon presentation rule: the page Hero owns the sermon title.
 * Published sermon bodies may retain Scripture, Big Idea/Central Question,
 * Introduction, outline headings, and full Scripture quotations, but must not
 * repeat the page title as an opening manuscript label or H1.
 */
export function findDuplicateSermonTitleInOpening(body: string, title: string, locale: ContentLanguage) {
  const expected = normalizeSermonTitleCandidate(title, locale);
  const lines = body.split("\n");
  const nonempty = lines.map((line, index) => ({line: line.trim(), index})).filter(({line}) => line).slice(0, 10);
  const firstIndex = nonempty[0]?.index;
  for (const {line, index} of nonempty) {
    const direct = normalizeSermonTitleCandidate(line, locale);
    if ((index === firstIndex || /^#\s+/.test(line)) && direct === expected) return {line: index + 1, value: line};
  }
  for (let index = 0; index < Math.min(lines.length, 40); index++) {
    const line = lines[index].trim().replace(/^#{1,6}\s*/, "");
    const match = /^(?:题目|讲题|主题)\s*[：:]\s*(.*)$/i.exec(line) ?? /^(?:title|sermon title|theme)\s*:\s*(.*)$/i.exec(line);
    if (!match) continue;
    const candidate = normalizeSermonTitleCandidate(match[1], locale);
    if (candidate === expected || candidate.startsWith(`${expected}:`) || candidate.startsWith(`${expected}：`)) return {line: index + 1, value: lines[index].trim()};
  }
  return null;
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
