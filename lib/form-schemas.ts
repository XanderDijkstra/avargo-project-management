import type { FormType } from "./types";

export type FormField = {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "email"
    | "url"
    | "number"
    | "select"
    | "multiselect"
    | "tel";
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
};

export type FormSchema = {
  formType: FormType;
  title: string;
  description: string;
  sections: { title: string; fields: FormField[] }[];
};

export const FORM_SCHEMAS: Record<FormType, FormSchema> = {
  website: {
    formType: "website",
    title: "Onboarding – Nettside",
    description:
      "Fyll ut så godt du kan. Du kan hoppe over felter du er usikker på — vi avklarer i oppfølgingsmøtet.",
    sections: [
      {
        title: "Selskap og kontakt",
        fields: [
          { name: "companyName", label: "Selskapsnavn", type: "text", required: true },
          { name: "contactName", label: "Kontaktperson", type: "text", required: true },
          { name: "contactEmail", label: "E-post", type: "email", required: true },
          { name: "contactPhone", label: "Telefon", type: "tel" },
        ],
      },
      {
        title: "Om virksomheten",
        fields: [
          {
            name: "oneLineDescription",
            label: "Beskriv virksomheten i én setning",
            type: "text",
            required: true,
          },
          {
            name: "targetCustomer",
            label: "Hvem er drømmekunden?",
            type: "textarea",
            helpText: "Geografi, bransje, størrelse, situasjon.",
          },
          {
            name: "usp",
            label: "Hva skiller dere fra konkurrentene?",
            type: "textarea",
          },
          {
            name: "competitors",
            label: "Tre konkurrenter (URL-er, kommaseparert)",
            type: "text",
          },
        ],
      },
      {
        title: "Merkevare",
        fields: [
          {
            name: "logoUrl",
            label: "Logo (lenke til fil hvis tilgjengelig)",
            type: "url",
          },
          {
            name: "colors",
            label: "Fargepalett (hex-koder eller beskrivelse)",
            type: "text",
          },
          {
            name: "fontPreference",
            label: "Skrifttype-preferanse",
            type: "text",
          },
          {
            name: "inspirationSites",
            label: "Tre nettsider dere liker",
            type: "textarea",
            helpText: "URL + kort om hva dere liker.",
          },
        ],
      },
      {
        title: "Nettside-innhold",
        fields: [
          {
            name: "pages",
            label: "Hvilke sider trenger dere?",
            type: "multiselect",
            options: [
              { value: "home", label: "Forside" },
              { value: "about", label: "Om oss" },
              { value: "services", label: "Tjenester" },
              { value: "contact", label: "Kontakt" },
              { value: "faq", label: "FAQ" },
              { value: "blog", label: "Blogg" },
              { value: "portfolio", label: "Portefølje / Case" },
              { value: "team", label: "Team / Ansatte" },
            ],
          },
          {
            name: "features",
            label: "Funksjoner?",
            type: "multiselect",
            options: [
              { value: "contactForm", label: "Kontaktskjema" },
              { value: "booking", label: "Booking / avtalesystem" },
              { value: "newsletter", label: "Nyhetsbrev-påmelding" },
              { value: "shop", label: "Nettbutikk" },
              { value: "multilanguage", label: "Flerspråklig" },
            ],
          },
          {
            name: "domainInfo",
            label: "Eksisterende domene?",
            type: "text",
            helpText: "URL + hvem som har tilgang.",
          },
          {
            name: "additionalNotes",
            label: "Annet vi bør vite?",
            type: "textarea",
          },
        ],
      },
    ],
  },
  "meta-ads": {
    formType: "meta-ads",
    title: "Onboarding – Meta Ads",
    description: "For oppsett av Meta-annonsering på Facebook og Instagram.",
    sections: [
      {
        title: "Selskap og kontakt",
        fields: [
          { name: "companyName", label: "Selskapsnavn", type: "text", required: true },
          { name: "contactName", label: "Kontaktperson", type: "text", required: true },
          { name: "contactEmail", label: "E-post", type: "email", required: true },
        ],
      },
      {
        title: "Eksisterende oppsett",
        fields: [
          {
            name: "existingBM",
            label: "Har dere Meta Business Manager fra før?",
            type: "select",
            options: [
              { value: "yes", label: "Ja" },
              { value: "no", label: "Nei" },
              { value: "unsure", label: "Usikker" },
            ],
          },
          { name: "facebookPageUrl", label: "Facebook-side URL", type: "url" },
          { name: "instagramHandle", label: "Instagram-konto", type: "text" },
          {
            name: "previousAds",
            label: "Har dere kjørt annonser før? Hva fungerte / ikke?",
            type: "textarea",
          },
        ],
      },
      {
        title: "Mål og budsjett",
        fields: [
          {
            name: "primaryGoal",
            label: "Primært mål",
            type: "select",
            required: true,
            options: [
              { value: "leads", label: "Leads / kontaktskjema" },
              { value: "calls", label: "Telefonsamtaler" },
              { value: "purchases", label: "Salg" },
              { value: "traffic", label: "Trafikk til nettside" },
              { value: "awareness", label: "Merkevarekjennskap" },
            ],
          },
          {
            name: "monthlyBudget",
            label: "Månedsbudsjett (NOK, eks. mva.)",
            type: "number",
            required: true,
          },
          {
            name: "geoTargeting",
            label: "Geografisk målgruppe",
            type: "text",
            placeholder:
              "F.eks. 'Trøndelag', 'hele Norge', 'Trondheim + 50km'",
          },
          {
            name: "audienceDescription",
            label: "Målgruppebeskrivelse",
            type: "textarea",
          },
        ],
      },
      {
        title: "Kreativt",
        fields: [
          {
            name: "existingAssets",
            label: "Eksisterende bilder/video (lenke til Drive/Dropbox)",
            type: "url",
          },
          {
            name: "uspForAds",
            label: "Hovedbudskap / USP for annonser",
            type: "textarea",
          },
          { name: "additionalNotes", label: "Annet?", type: "textarea" },
        ],
      },
    ],
  },
  "google-ads": {
    formType: "google-ads",
    title: "Onboarding – Google Ads",
    description:
      "For oppsett av Google-annonsering (Search, Performance Max).",
    sections: [
      {
        title: "Selskap og kontakt",
        fields: [
          { name: "companyName", label: "Selskapsnavn", type: "text", required: true },
          { name: "contactName", label: "Kontaktperson", type: "text", required: true },
          { name: "contactEmail", label: "E-post", type: "email", required: true },
          { name: "websiteUrl", label: "Nettside-URL", type: "url", required: true },
        ],
      },
      {
        title: "Eksisterende oppsett",
        fields: [
          {
            name: "existingGoogleAdsAccount",
            label: "Har dere Google Ads-konto fra før?",
            type: "select",
            options: [
              { value: "yes", label: "Ja" },
              { value: "no", label: "Nei" },
              { value: "unsure", label: "Usikker" },
            ],
          },
          {
            name: "ga4Status",
            label: "Google Analytics 4 satt opp?",
            type: "select",
            options: [
              { value: "yes", label: "Ja" },
              { value: "no", label: "Nei" },
              { value: "unsure", label: "Usikker" },
            ],
          },
          {
            name: "gscStatus",
            label: "Google Search Console satt opp?",
            type: "select",
            options: [
              { value: "yes", label: "Ja" },
              { value: "no", label: "Nei" },
              { value: "unsure", label: "Usikker" },
            ],
          },
        ],
      },
      {
        title: "Mål og budsjett",
        fields: [
          {
            name: "primaryGoal",
            label: "Primært konverteringsmål",
            type: "select",
            required: true,
            options: [
              { value: "leads", label: "Leads / kontaktskjema" },
              { value: "calls", label: "Telefonsamtaler" },
              { value: "purchases", label: "Salg" },
              { value: "traffic", label: "Trafikk" },
            ],
          },
          {
            name: "monthlyBudget",
            label: "Månedsbudsjett (NOK, eks. mva.)",
            type: "number",
            required: true,
          },
          {
            name: "geoTargeting",
            label: "Geografisk målgruppe",
            type: "text",
          },
          {
            name: "topKeywords",
            label: "Hvilke søkeord vil dere bli funnet på?",
            type: "textarea",
            helpText: "Liste opp 5–10 nøkkelord eller fraser.",
          },
          {
            name: "competitors",
            label: "Tre konkurrenter (URL-er)",
            type: "text",
          },
          { name: "additionalNotes", label: "Annet?", type: "textarea" },
        ],
      },
    ],
  },
  software: {
    formType: "software",
    title: "Onboarding – Programvare / Utvikling",
    description:
      "For tilpassede utviklingsprosjekter (apper, verktøy, automatisering).",
    sections: [
      {
        title: "Selskap og kontakt",
        fields: [
          { name: "companyName", label: "Selskapsnavn", type: "text", required: true },
          { name: "contactName", label: "Kontaktperson", type: "text", required: true },
          { name: "contactEmail", label: "E-post", type: "email", required: true },
        ],
      },
      {
        title: "Problemet og løsningen",
        fields: [
          {
            name: "problemStatement",
            label: "Hvilket problem skal vi løse?",
            type: "textarea",
            required: true,
          },
          {
            name: "currentSolution",
            label: "Hvordan løser dere det i dag?",
            type: "textarea",
          },
          {
            name: "successCriteria",
            label: "Hva må være på plass for at dette skal lykkes?",
            type: "textarea",
          },
        ],
      },
      {
        title: "Teknisk kontekst",
        fields: [
          { name: "users", label: "Hvem er brukerne?", type: "textarea" },
          {
            name: "estimatedUserCount",
            label: "Estimert antall brukere",
            type: "number",
          },
          {
            name: "existingTools",
            label: "Eksisterende verktøy / systemer som må integreres",
            type: "textarea",
          },
          {
            name: "hostingPreference",
            label: "Hosting-preferanse",
            type: "select",
            options: [
              { value: "no-preference", label: "Ingen preferanse" },
              { value: "norwegian", label: "Norsk hosting (GDPR-fokus)" },
              { value: "vercel", label: "Vercel / moderne cloud" },
              { value: "self-hosted", label: "Egen server" },
            ],
          },
        ],
      },
      {
        title: "Tidsramme og budsjett",
        fields: [
          {
            name: "timeline",
            label: "Ønsket tidsramme",
            type: "text",
            placeholder: "F.eks. '3 måneder', 'innen Q3'",
          },
          {
            name: "budgetRange",
            label: "Budsjettramme (NOK)",
            type: "text",
            placeholder: "F.eks. '50 000 – 150 000'",
          },
          { name: "additionalNotes", label: "Annet?", type: "textarea" },
        ],
      },
    ],
  },
};
