export type Service =
  | "website"
  | "gbp"
  | "google-ads"
  | "meta-ads"
  | "linkedin"
  | "software";

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

export type TaskStatus = "todo" | "doing" | "done" | "blocked";

export type Workstream = Service | "general";

export type Task = {
  id: string;
  title: string;
  description?: string;
  workstream: Workstream;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  fromTemplate: boolean;
};

export type FormType = "website" | "meta-ads" | "google-ads" | "software";

export type FormSubmission = {
  id: string;
  formType: FormType;
  submittedAt: string;
  submittedBy?: string;
  data: Record<string, unknown>;
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
  tasks: Task[];
  submissions: FormSubmission[];
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
