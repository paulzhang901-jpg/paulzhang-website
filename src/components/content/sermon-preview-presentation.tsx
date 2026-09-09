import {Fragment} from "react";

type PreviewBlock =
  | {kind: "major-heading"; line: string}
  | {kind: "minor-heading"; line: string}
  | {kind: "paragraph"; lines: string[]};

export type ProtectedPreviewPresentation = {
  topicLine: string;
  scriptureLines: string[];
  introductionLine: string;
  bodyBlocks: PreviewBlock[];
};

export function supportsStructuredSermonPresentation(body: string) {
  const lines = body.split("\n");
  const topicIndex = lines.findIndex((line) => line.startsWith("主题："));
  return lines[0]?.startsWith("经文：") === true && topicIndex > 0 && lines[topicIndex + 1]?.startsWith("引言：") === true;
}

const isMajorHeading = (line: string) => /^[一二三四五六七八九十]+、/.test(line) || line.startsWith("结语：") || line === "最后的呼召";
const isMinorHeading = (line: string) => /^\d+\.\s*/.test(line) || line.startsWith("一个故事：");

export function parseProtectedPreviewSermonBody(body: string): ProtectedPreviewPresentation {
  const lines = body.split("\n");
  const topicIndex = lines.findIndex((line) => line.startsWith("主题："));
  const introductionIndex = lines.findIndex((line) => line.startsWith("引言："));
  if (!supportsStructuredSermonPresentation(body) || introductionIndex !== topicIndex + 1) {
    throw new Error("Protected sermon preview preamble does not match the governed semantic contract");
  }

  const bodyBlocks: PreviewBlock[] = [];
  let paragraph: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length) bodyBlocks.push({kind: "paragraph", lines: paragraph});
    paragraph = [];
  };

  for (const line of lines.slice(introductionIndex + 1)) {
    if (!line) {
      flushParagraph();
    } else if (isMajorHeading(line)) {
      flushParagraph();
      bodyBlocks.push({kind: "major-heading", line});
    } else if (isMinorHeading(line)) {
      flushParagraph();
      bodyBlocks.push({kind: "minor-heading", line});
    } else {
      paragraph.push(line);
    }
  }
  flushParagraph();

  return {
    topicLine: lines[topicIndex],
    scriptureLines: lines.slice(0, topicIndex),
    introductionLine: lines[introductionIndex],
    bodyBlocks,
  };
}

function LineGroup({lines}: {lines: string[]}) {
  return <>{lines.map((line, index) => <Fragment key={`${index}-${line}`}><span>{line}</span>{index < lines.length - 1 ? <br /> : null}</Fragment>)}</>;
}

export function SermonProtectedPreviewPresentation({body, scriptureRange}: {body: string; scriptureRange: string}) {
  const presentation = parseProtectedPreviewSermonBody(body);
  const scriptureLines = presentation.scriptureLines.map((line, index) => index === 0 ? line.slice("经文：".length) : line);

  return <article className="prose-content sermon-preview-content">
    <section aria-label="讲章主题">
      <p className="sermon-preview-topic">{presentation.topicLine}</p>
    </section>
    <section className="sermon-preview-scripture" aria-labelledby="preview-scripture-heading">
      <h2 id="preview-scripture-heading">经文：{scriptureRange}</h2>
      <blockquote><LineGroup lines={scriptureLines} /></blockquote>
    </section>
    <section aria-labelledby="preview-introduction-heading">
      <h2 id="preview-introduction-heading" className="sermon-preview-introduction">{presentation.introductionLine}</h2>
      {presentation.bodyBlocks.map((block, index) => {
        if (block.kind === "major-heading") return <h2 key={`${index}-${block.line}`}>{block.line}</h2>;
        if (block.kind === "minor-heading") return <h3 key={`${index}-${block.line}`}>{block.line}</h3>;
        return <p key={`${index}-${block.lines[0]}`}><LineGroup lines={block.lines} /></p>;
      })}
    </section>
  </article>;
}

const isStandaloneSectionHeading = (line: string) => line === "经文" || line === "引言" || line === "结语" || line === "最后的呼召";

export function parseCanonicalReaderBody(body: string) {
  const lines = body.split("\n");
  const scriptureIndex = lines.findIndex((line) => line === "经文");
  if (scriptureIndex < 0) throw new Error("Canonical sermon reader body is missing its Scripture boundary");
  return lines.slice(scriptureIndex);
}

export function supportsCanonicalReaderPresentation(body: string) {
  return body.split("\n").includes("经文");
}

export function SermonCanonicalTextPresentation({body, scriptureRange}: {body: string; scriptureRange: string}) {
  return <article className="prose-content sermon-preview-content">
    {parseCanonicalReaderBody(body).map((line, index) => {
      if (!line) return <div key={index} aria-hidden="true" className="h-4" />;
      if (line === "经文") return <h2 key={index}>经文：{scriptureRange}</h2>;
      if (isMajorHeading(line) || isStandaloneSectionHeading(line)) return <h2 key={index}>{line}</h2>;
      if (isMinorHeading(line)) return <h3 key={index}>{line}</h3>;
      if (/^【[^】]*\d+:\d+】/.test(line)) return <blockquote key={index}>{line}</blockquote>;
      return <p key={index}>{line}</p>;
    })}
  </article>;
}
