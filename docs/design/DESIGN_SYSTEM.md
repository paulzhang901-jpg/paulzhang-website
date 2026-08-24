# V1 Foundation Design System

## Character

The interface should feel calm, warm, trustworthy, reflective, human, Christ-centered, and content-first. It must avoid generic SaaS, aggressive marketing, course-dashboard, social-feed, and heavy poster aesthetics.

## Semantic tokens

`src/styles/globals.css` is the semantic layer for color, spacing, typography, radius, shadow, containers, focus, and motion. Tailwind implements these tokens but does not replace their meaning. Optional truth/story/growth/companionship colors remain subtle accents inside one coherent system. Dark mode is token-ready but deferred.

## Typography and spacing

System font stacks prioritize bilingual rendering (`PingFang SC`, `Microsoft YaHei`, and platform fallbacks); a restrained serif stack supports reflective headings. Chinese long-form copy uses generous line height. Section rhythm uses a responsive semantic spacing token.

## Containers

- `Container`: general site composition, max width approximately 1216px.
- `ReadingContainer`: long-form reading, max width approximately 736px.
- `WideContainer`: exceptional wide composition only.

## Foundation components

Core UI: Button/LinkButton, Card, Badge, Divider, Stack, Inline, VisuallyHidden, Container, ReadingContainer, WideContainer, Section, and SectionHeading.

Layout/navigation: SiteHeader, responsive navigation, LanguageSwitcher, SiteFooter, Breadcrumbs, and skip link.

Content/formation foundations: ContentCard, ArticleCard, StoryCard, ContentMeta, TopicBadge, ReadingTime, ScriptureBlock, ReflectionBlock, PracticeBlock, PrayerBlock, NextStepCTA, and CompanionshipCTA. These are structural primitives, not final page UX.

## Responsive and accessibility rules

Design mobile-first, then enhance for tablet and desktop. Use semantic HTML, keyboard-operable links and controls, visible focus, a skip link, coherent heading structure, adequate touch targets, and restrained ARIA. Motion must be subtle and respect `prefers-reduced-motion`. Images added later require useful alt text or intentional empty alt text when decorative.

## Locale behavior

Shared components render localized labels from `src/config/i18n.ts`. Chinese is unprefixed; English uses `/en`. Language switching stores explicit preference locally and outranks future browser-language hints. Canonical editorial translation matching is deferred to the Content Foundation.
