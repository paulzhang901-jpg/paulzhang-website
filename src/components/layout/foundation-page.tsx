import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Container, ReadingContainer } from "@/components/layout/container";
import { Section, SectionHeading } from "@/components/layout/section";
import { Badge } from "@/components/ui/primitives";
import { getMessages, type Locale } from "@/config/i18n";
import { getRoute, type RouteId } from "@/lib/i18n/routing";

export function FoundationPage({locale, routeId}: {locale: Locale; routeId: RouteId}) {
  const copy = getMessages(locale);
  const route = getRoute(routeId);
  const title = routeId === "home" ? copy.siteName : copy[route.label];

  return <Section>
    <Container>
      <Breadcrumbs locale={locale} routeId={routeId} />
      <ReadingContainer className="px-0">
        <SectionHeading eyebrow={copy.foundation} title={title}>
          <p>{routeId === "home" ? copy.siteDescription : copy.foundationNote}</p>
        </SectionHeading>
        <Badge>V1 Runtime Foundation</Badge>
      </ReadingContainer>
    </Container>
  </Section>;
}
