"use client";

import {useState} from "react";
import type {ContentLanguage} from "@/types/content";
import type {PublishedNarration} from "@/lib/content/published-narrations";
import {AiAudioPlayer} from "./ai-audio-player";
import {ReadAloudPlayer} from "./read-aloud-player";

type Props = {
  locale: ContentLanguage; title: string; contentId: string;
  narration?: PublishedNarration;
};

function NarrationChoice({locale, title, contentId, narration}: Props) {
  const [browserFallback, setBrowserFallback] = useState(false);
  // Render exactly one narration engine. No asset means unchanged legacy behavior.
  if (!narration || browserFallback) {
    return <ReadAloudPlayer locale={locale} title={title} contentId={contentId} />;
  }
  return <AiAudioPlayer src={narration.src} title={title} locale={locale}
    onBrowserFallback={() => setBrowserFallback(true)} />;
}

export function ArticleNarration(props: Props) {
  // Locale/content/source changes remount the choice and stop the old player.
  return <NarrationChoice key={`${props.contentId}:${props.locale}:${props.narration?.audioSha256 ?? "browser"}`} {...props} />;
}
