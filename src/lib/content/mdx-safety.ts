import { createProcessor } from "@mdx-js/mdx";

export const approvedMdxComponents = [
  "ScriptureBlock", "ReflectionBlock", "PracticeBlock", "PrayerBlock", "RelatedContent", "NextStepCTA",
] as const;

type MdxNode = {type?: string; name?: string | null; value?: unknown; attributes?: Array<{type?: string; value?: unknown}>; children?: MdxNode[]};

export function validateMdxSource(source: string): string[] {
  const errors: string[] = [];
  let tree: MdxNode;
  try {
    tree = createProcessor({format: "mdx"}).parse(source) as MdxNode;
  } catch (error) {
    return [`invalid MDX: ${error instanceof Error ? error.message : String(error)}`];
  }

  const walk = (node: MdxNode) => {
    if (["mdxjsEsm", "mdxFlowExpression", "mdxTextExpression"].includes(node.type ?? "")) {
      errors.push(`disallowed MDX code node: ${node.type}`);
    }
    if (["mdxJsxFlowElement", "mdxJsxTextElement"].includes(node.type ?? "")) {
      if (!node.name || !approvedMdxComponents.includes(node.name as (typeof approvedMdxComponents)[number])) {
        errors.push(`unapproved MDX component: ${node.name ?? "fragment"}`);
      }
      for (const attribute of node.attributes ?? []) {
        if (attribute.type !== "mdxJsxAttribute" || (attribute.value !== null && typeof attribute.value !== "string")) {
          errors.push(`MDX component ${node.name ?? "unknown"} has a non-literal attribute`);
        }
      }
    }
    node.children?.forEach(walk);
  };
  walk(tree);
  return errors;
}
