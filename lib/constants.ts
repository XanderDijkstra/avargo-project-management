import type {
  FormType,
  PipelineStage,
  Service,
  Source,
  TaskStatus,
  Workstream,
} from "./types";

export const STAGE_LABELS: Record<PipelineStage, string> = {
  "henvisning-mottatt": "Henvisning mottatt",
  "scoping": "Scoping",
  "tilbud-sendt": "Tilbud sendt",
  "akseptert": "Akseptert",
  "bygging": "Bygging",
  "lansert": "Lansert",
  "lopende-drift": "Løpende drift",
  "avsluttet": "Avsluttet",
  "pauset": "Pauset",
};

export const SERVICE_LABELS: Record<Service, string> = {
  "website": "Nettside",
  "gbp": "Google Bedriftsprofil",
  "google-ads": "Google Ads",
  "meta-ads": "Meta Ads",
  "linkedin": "LinkedIn",
  "software": "Programvare / Utvikling",
};

export const SOURCE_LABELS: Record<Source, string> = {
  "Riktig Regnskap": "Riktig Regnskap",
  "Direct": "Direkte",
  "Referral": "Henvisning",
  "Other": "Annet",
};

// Pipeline columns shown in the main kanban (in order). Pauset and avsluttet
// are reachable via the stage selector but appear collapsed at the end.
export const KANBAN_STAGES: PipelineStage[] = [
  "henvisning-mottatt",
  "scoping",
  "tilbud-sendt",
  "akseptert",
  "bygging",
  "lansert",
  "lopende-drift",
];

export const SECONDARY_STAGES: PipelineStage[] = ["pauset", "avsluttet"];

export const ALL_STAGES: PipelineStage[] = [...KANBAN_STAGES, ...SECONDARY_STAGES];

export const ALL_SERVICES: Service[] = [
  "website",
  "gbp",
  "google-ads",
  "meta-ads",
  "linkedin",
  "software",
];

export const ALL_SOURCES: Source[] = [
  "Riktig Regnskap",
  "Direct",
  "Referral",
  "Other",
];

export const WORKSTREAM_LABELS: Record<Workstream, string> = {
  "website": "Nettside",
  "gbp": "Google Bedriftsprofil",
  "google-ads": "Google Ads",
  "meta-ads": "Meta Ads",
  "linkedin": "LinkedIn",
  "software": "Programvare",
  "general": "Generelt",
};

export const ALL_WORKSTREAMS: Workstream[] = [
  "website",
  "gbp",
  "google-ads",
  "meta-ads",
  "linkedin",
  "software",
  "general",
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  "todo": "Å gjøre",
  "doing": "Pågår",
  "done": "Ferdig",
  "blocked": "Blokkert",
};

export const ALL_TASK_STATUSES: TaskStatus[] = [
  "todo",
  "doing",
  "done",
  "blocked",
];

export const FORM_TYPE_LABELS: Record<FormType, string> = {
  "website": "Nettside",
  "meta-ads": "Meta Ads",
  "google-ads": "Google Ads",
  "software": "Programvare / Utvikling",
};

export const ALL_FORM_TYPES: FormType[] = [
  "website",
  "meta-ads",
  "google-ads",
  "software",
];
