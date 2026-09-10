import {MDXRemote} from "next-mdx-remote/rsc";
import {TopicBadge} from "@/components/content/content-foundation";
import {Container, ReadingContainer} from "@/components/layout/container";
import {Section} from "@/components/layout/section";
import {SermonCanonicalTextPresentation, SermonProtectedPreviewPresentation, supportsCanonicalReaderPresentation, supportsStructuredSermonPresentation} from "@/components/content/sermon-preview-presentation";
import type {PublishedSermon} from "@/lib/sermons/published";

export function SermonPublicationPage({sermon, preview = false}: {sermon: PublishedSermon; preview?: boolean}) {
  const structuredPresentation = preview || supportsStructuredSermonPresentation(sermon.body) || supportsCanonicalReaderPresentation(sermon.body);
  const usesStructuredBody = supportsStructuredSermonPresentation(sermon.body);
  const usesCanonicalReaderBody = supportsCanonicalReaderPresentation(sermon.body);
  return <>
    <Section className="border-b bg-muted/40">
      <Container><ReadingContainer className="px-0">
        <div className="text-sm font-semibold text-primary">{preview ? "受保护的人类预览" : "讲章"}</div>
        {structuredPresentation ? <>
          <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">{sermon.title}</h1>
          <p className="mt-4 text-xl leading-relaxed text-muted-foreground">{sermon.subtitle}</p>
          <div className="mt-5 text-sm text-muted-foreground">
            {sermon.sermonSeries ? <>{sermon.sermonSeries}<span aria-hidden="true"> · </span></> : null}{sermon.scriptureRange}
          </div>
        </> : <>
          <p className="mt-3 text-xl text-muted-foreground">{sermon.subtitle}</p>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {sermon.sermonSeries ? <span>{sermon.sermonSeries}</span> : null}
            <span>{sermon.scriptureRange}</span>
          </div>
        </>}
        <div className="mt-5 flex flex-wrap gap-2">{sermon.themes.map((theme) => <TopicBadge key={theme}>{theme}</TopicBadge>)}</div>
      </ReadingContainer></Container>
    </Section>
    <Section>
      <Container><ReadingContainer className="px-0">{usesStructuredBody
        ? <SermonProtectedPreviewPresentation body={sermon.body} scriptureRange={sermon.scriptureRange} />
        : preview || usesCanonicalReaderBody
          ? <SermonCanonicalTextPresentation body={sermon.body} scriptureRange={sermon.scriptureRange} />
          : <article className="prose-content"><MDXRemote source={sermon.body.replace(/^\*\*Website Canonical Edition v1\.0\*\*$/m, "")} /></article>}
      </ReadingContainer></Container>
    </Section>
  </>;
}
