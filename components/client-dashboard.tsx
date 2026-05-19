import { Badge } from "@/components/ui/badge";
import { STAGE_LABELS } from "@/lib/constants";
import type { Engagement } from "@/lib/types";
import { formatDate } from "@/lib/utils";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1.5 text-lg font-semibold text-gray-900">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-gray-500">{hint}</div>}
    </div>
  );
}

export function ClientDashboard({ engagement }: { engagement: Engagement }) {
  const totalTasks = engagement.tasks.length;
  const doneTasks = engagement.tasks.filter((t) => t.status === "done").length;
  const doingTasks = engagement.tasks.filter(
    (t) => t.status === "doing",
  ).length;
  const blockedTasks = engagement.tasks.filter(
    (t) => t.status === "blocked",
  ).length;
  const progress =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const latestStage = [...engagement.stageHistory].sort((a, b) =>
    b.enteredAt.localeCompare(a.enteredAt),
  )[0];

  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat
        label="Stadium"
        value={
          <Badge variant="brand" className="text-sm">
            {STAGE_LABELS[engagement.stage]}
          </Badge>
        }
        hint={
          latestStage ? `Siden ${formatDate(latestStage.enteredAt)}` : undefined
        }
      />
      <Stat
        label="Oppgaver"
        value={
          totalTasks === 0 ? "—" : `${doneTasks} / ${totalTasks}`
        }
        hint={
          totalTasks === 0
            ? "Genereres ved «Bygging»"
            : `${progress}% ferdig`
        }
      />
      <Stat
        label="Pågår"
        value={doingTasks}
        hint={blockedTasks > 0 ? `${blockedTasks} blokkert` : undefined}
      />
      <Stat
        label="Skjemaer mottatt"
        value={engagement.submissions.length}
        hint={
          engagement.submissions.length === 0
            ? "Ingen enda"
            : `Siste ${formatDate(
                [...engagement.submissions].sort((a, b) =>
                  b.submittedAt.localeCompare(a.submittedAt),
                )[0].submittedAt,
              )}`
        }
      />
    </section>
  );
}
