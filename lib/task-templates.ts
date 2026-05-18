import type { Service, Workstream } from "./types";

export type TaskTemplate = {
  title: string;
  description?: string;
  workstream: Workstream;
};

// Templates fired when an engagement enters stage "bygging"
// for each service the engagement has.
export const TASK_TEMPLATES: Record<Service, TaskTemplate[]> = {
  website: [
    {
      title: "Sett opp Google Search Console",
      workstream: "website",
      description: "Verifiser domenet og send inn sitemap.",
    },
    {
      title: "Sett opp GA4-property",
      workstream: "website",
      description: "Opprett property, installer tagging på siden.",
    },
    {
      title: "Installer Google Tag Manager",
      workstream: "website",
      description:
        "GTM-container på siden, koble til GA4 og evt. Meta Pixel.",
    },
    { title: "Wireframe godkjent av kunde", workstream: "website" },
    {
      title: "Innholdsproduksjon ferdig",
      workstream: "website",
      description: "Tekst, bilder, evt. video for alle sider.",
    },
    { title: "Mobiltilpasning testet", workstream: "website" },
    {
      title: "Hastighetsoptimalisering (Lighthouse > 85)",
      workstream: "website",
    },
    { title: "Metabeskrivelser og titler satt", workstream: "website" },
    { title: "robots.txt og sitemap.xml på plass", workstream: "website" },
    { title: "Cookie-banner og personvern", workstream: "website" },
    { title: "Kundegjennomgang og endringsrunde", workstream: "website" },
    { title: "DNS pekt til ny side", workstream: "website" },
    { title: "SSL verifisert", workstream: "website" },
  ],
  gbp: [
    { title: "Sjekk om GBP allerede finnes", workstream: "gbp" },
    {
      title: "Start verifisering (postkort/video)",
      workstream: "gbp",
      description: "KRITISK SLI — start dag én, kan ta 1–3 uker.",
    },
    {
      title: "Fyll ut alle kategorier og tjenester",
      workstream: "gbp",
    },
    {
      title: "Last opp 10+ bilder (logo, fasade, interiør, team)",
      workstream: "gbp",
    },
    { title: "Sett åpningstider og helligdager", workstream: "gbp" },
    { title: "Skriv første GBP-post", workstream: "gbp" },
    {
      title: "Verifiser NAP-konsistens (navn/adresse/telefon)",
      workstream: "gbp",
    },
  ],
  "google-ads": [
    { title: "Opprett Google Ads-konto", workstream: "google-ads" },
    { title: "Koble Ads til GA4", workstream: "google-ads" },
    { title: "Konfigurer konverteringssporing", workstream: "google-ads" },
    { title: "Søkeordsanalyse og negativ-liste", workstream: "google-ads" },
    {
      title: "Bygg første Search-kampanje (pauset)",
      workstream: "google-ads",
    },
    {
      title: "Bygg første Performance Max (pauset)",
      workstream: "google-ads",
    },
    {
      title: "Skriv 3–5 RSA-er per annonsegruppe",
      workstream: "google-ads",
    },
    { title: "Fyll ut alle annonseutvidelser", workstream: "google-ads" },
    {
      title: "Verifiser sporing fungerer i live-modus",
      workstream: "google-ads",
    },
  ],
  "meta-ads": [
    {
      title: "Opprett/koble Meta Business Manager",
      workstream: "meta-ads",
      description: "Kunden må eie BM. Du får partner-tilgang.",
    },
    { title: "Installer Meta Pixel på nettsiden", workstream: "meta-ads" },
    {
      title: "Sett opp Conversions API (server-side)",
      workstream: "meta-ads",
    },
    {
      title: "Definer Custom Audiences",
      workstream: "meta-ads",
      description: "Besøkende, kundeliste hvis tilgjengelig.",
    },
    { title: "Opprett Lookalike (1% LAL)", workstream: "meta-ads" },
    {
      title: "Lag 3–5 kreative annonser (bilde/video + tekst)",
      workstream: "meta-ads",
    },
    {
      title: "Bygg første konverteringskampanje (pauset)",
      workstream: "meta-ads",
    },
    { title: "Verifiser sporing i Events Manager", workstream: "meta-ads" },
  ],
  linkedin: [
    { title: "Opprett/oppdater bedriftsside", workstream: "linkedin" },
    { title: "Last opp logo og banner", workstream: "linkedin" },
    { title: "Skriv bedriftsbeskrivelse", workstream: "linkedin" },
    {
      title: "Be eiere/ansatte koble seg til siden",
      workstream: "linkedin",
    },
    {
      title: "Lag innholdsmal (format, tone, hashtags)",
      workstream: "linkedin",
    },
    { title: "Skriv 4 startposter", workstream: "linkedin" },
  ],
  software: [
    {
      title: "Definer scope og leveranseliste skriftlig",
      workstream: "software",
    },
    { title: "Velg teknisk stack med kunden", workstream: "software" },
    { title: "Sett opp repository og deployment", workstream: "software" },
    { title: "Lag wireframes / brukerflyt", workstream: "software" },
    { title: "Definer database-skjema", workstream: "software" },
    { title: "Sett opp auth (hvis aktuelt)", workstream: "software" },
    { title: "MVP-funksjonalitet bygget", workstream: "software" },
    { title: "Brukerakseptansetest med kunde", workstream: "software" },
    { title: "Dokumentasjon levert", workstream: "software" },
  ],
};
