import Link from "next/link";

import { KanbanBoard } from "@/components/kanban-board";
import { SetupError } from "@/components/setup-error";
import { Button } from "@/components/ui/button";
import { listEngagements } from "@/lib/data";
import type { Engagement } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let engagements: Engagement[] = [];
  let error: string | null = null;
  try {
    engagements = await listEngagements();
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Pipeline</h1>
        <Button asChild>
          <Link href="/clients/new">Ny klient</Link>
        </Button>
      </div>
      {error ? (
        <SetupError message={error} />
      ) : (
        <KanbanBoard engagements={engagements} />
      )}
    </div>
  );
}
