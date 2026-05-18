import Link from "next/link";

import { KanbanBoard } from "@/components/kanban-board";
import { Button } from "@/components/ui/button";
import { listEngagements } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const engagements = await listEngagements();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Pipeline</h1>
        <Button asChild>
          <Link href="/engagements/new">Ny engasjement</Link>
        </Button>
      </div>
      <KanbanBoard engagements={engagements} />
    </div>
  );
}
