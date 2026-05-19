import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientDashboard } from "@/components/client-dashboard";
import { ClientPageTabs } from "@/components/client-page-tabs";
import { DeleteClientButton } from "@/components/delete-client-button";
import { EngagementEditForm } from "@/components/engagement-edit-form";
import { FormLinkGenerator } from "@/components/form-link-generator";
import { LinksPanel } from "@/components/links-panel";
import { NotesPanel } from "@/components/notes-panel";
import { StageSelector } from "@/components/stage-selector";
import { SubmissionsPanel } from "@/components/submissions-panel";
import { TaskKanban } from "@/components/task-kanban";
import { Badge } from "@/components/ui/badge";
import {
  SERVICE_LABELS,
  SOURCE_LABELS,
  STAGE_LABELS,
} from "@/lib/constants";
import { getEngagement } from "@/lib/data";
import { formatDate, formatNok } from "@/lib/utils";

export default async function EngagementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const engagement = await getEngagement(slug);
  if (!engagement) notFound();

  const hasFinancials =
    engagement.setupFee != null ||
    engagement.monthlyRetainer != null ||
    engagement.adBudget?.google != null ||
    engagement.adBudget?.meta != null;

  const history = [...engagement.stageHistory].sort((a, b) =>
    b.enteredAt.localeCompare(a.enteredAt),
  );

  const totalTasks = engagement.tasks.length;
  const doneTasks = engagement.tasks.filter((t) => t.status === "done").length;

  const infoContent = (
    <div className="space-y-8">
      <ClientDashboard engagement={engagement} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-8">
          <section className="space-y-3">
            <h2>Kontaktinformasjon</h2>
            <dl className="grid grid-cols-1 gap-y-2 text-sm md:grid-cols-[140px_1fr]">
              <dt className="text-gray-500">Kontakt</dt>
              <dd className="text-gray-900">{engagement.contactName}</dd>
              <dt className="text-gray-500">E-post</dt>
              <dd className="text-gray-900">
                <a
                  href={`mailto:${engagement.contactEmail}`}
                  className="text-brand hover:underline"
                >
                  {engagement.contactEmail}
                </a>
              </dd>
              {engagement.contactPhone && (
                <>
                  <dt className="text-gray-500">Telefon</dt>
                  <dd className="text-gray-900">
                    <a
                      href={`tel:${engagement.contactPhone}`}
                      className="text-brand hover:underline"
                    >
                      {engagement.contactPhone}
                    </a>
                  </dd>
                </>
              )}
            </dl>
          </section>

          <section className="space-y-3">
            <h2>Tjenester</h2>
            {engagement.services.length === 0 ? (
              <p className="text-sm text-gray-500">Ingen tjenester valgt.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {engagement.services.map((s) => (
                  <Badge key={s} variant="default">
                    {SERVICE_LABELS[s]}
                  </Badge>
                ))}
              </div>
            )}
          </section>

          {hasFinancials && (
            <section className="space-y-3">
              <h2>Økonomi</h2>
              <dl className="grid grid-cols-1 gap-y-2 text-sm md:grid-cols-[200px_1fr]">
                {engagement.setupFee != null && (
                  <>
                    <dt className="text-gray-500">Setup-honorar</dt>
                    <dd className="text-gray-900">
                      {formatNok(engagement.setupFee)}
                    </dd>
                  </>
                )}
                {engagement.monthlyRetainer != null && (
                  <>
                    <dt className="text-gray-500">Månedlig retainer</dt>
                    <dd className="text-gray-900">
                      {formatNok(engagement.monthlyRetainer)}
                    </dd>
                  </>
                )}
                {engagement.adBudget?.google != null && (
                  <>
                    <dt className="text-gray-500">
                      Annonsebudsjett Google / mnd
                    </dt>
                    <dd className="text-gray-900">
                      {formatNok(engagement.adBudget.google)}
                    </dd>
                  </>
                )}
                {engagement.adBudget?.meta != null && (
                  <>
                    <dt className="text-gray-500">
                      Annonsebudsjett Meta / mnd
                    </dt>
                    <dd className="text-gray-900">
                      {formatNok(engagement.adBudget.meta)}
                    </dd>
                  </>
                )}
              </dl>
            </section>
          )}

          <section className="space-y-4">
            <h2>Skjemaer</h2>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">
                Send skjema
              </h3>
              <p className="text-xs text-gray-500">
                Velg type og kopier lenken til kunden. Skjemaet pre-utfylles
                med kontaktinformasjon fra dette klienten.
              </p>
              <FormLinkGenerator slug={engagement.slug} />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">
                Mottatte skjemaer
              </h3>
              <SubmissionsPanel submissions={engagement.submissions} />
            </div>
          </section>

          <NotesPanel slug={engagement.slug} notes={engagement.notes} />
        </div>

        <aside className="space-y-6">
          <section className="space-y-2">
            <h3>Kilde</h3>
            <p className="text-sm text-gray-900">
              {SOURCE_LABELS[engagement.source]}
            </p>
            {engagement.sourceContact && (
              <p className="text-sm text-gray-500">
                Kontakt: {engagement.sourceContact}
              </p>
            )}
          </section>

          <LinksPanel slug={engagement.slug} links={engagement.links} />

          <section className="space-y-2">
            <h3>Stadiumshistorikk</h3>
            <ol className="space-y-1.5 text-sm">
              {history.map((h, i) => (
                <li
                  key={`${h.enteredAt}-${i}`}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="text-gray-900">
                    {STAGE_LABELS[h.stage]}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(h.enteredAt)}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );

  const tasksContent = (
    <TaskKanban
      slug={engagement.slug}
      tasks={engagement.tasks}
      stage={engagement.stage}
    />
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/clients"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Alle klienter
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1>{engagement.companyName}</h1>
          <Badge variant="brand">{STAGE_LABELS[engagement.stage]}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <StageSelector slug={engagement.slug} current={engagement.stage} />
          <EngagementEditForm engagement={engagement} />
          <DeleteClientButton
            slug={engagement.slug}
            companyName={engagement.companyName}
          />
        </div>
      </div>

      <ClientPageTabs
        infoContent={infoContent}
        tasksContent={tasksContent}
        taskCount={totalTasks}
        taskDone={doneTasks}
      />
    </div>
  );
}
