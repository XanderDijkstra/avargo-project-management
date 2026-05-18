export type Service =
  | "website"
  | "gbp"
  | "google-ads"
  | "meta-ads"
  | "linkedin";

export type PipelineStage =
  | "henvisning-mottatt"
  | "scoping"
  | "tilbud-sendt"
  | "akseptert"
  | "bygging"
  | "lansert"
  | "lopende-drift"
  | "avsluttet"
  | "pauset";

export type Source = "Riktig Regnskap" | "Direct" | "Referral" | "Other";

export type Note = {
  id: string;
  date: string;
  content: string;
};

export type Link = {
  label: string;
  url: string;
};

export type StageEntry = {
  stage: PipelineStage;
  enteredAt: string;
};

export type Engagement = {
  id: string;
  slug: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  source: Source;
  sourceContact?: string;
  services: Service[];
  stage: PipelineStage;
  setupFee?: number;
  monthlyRetainer?: number;
  adBudget?: {
    google?: number;
    meta?: number;
  };
  notes: Note[];
  links: Link[];
  stageHistory: StageEntry[];
  createdAt: string;
  updatedAt: string;
};

export type NewEngagementInput = {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  source: Source;
  sourceContact?: string;
  services: Service[];
  stage: PipelineStage;
  setupFee?: number;
  monthlyRetainer?: number;
  adBudget?: {
    google?: number;
    meta?: number;
  };
};
