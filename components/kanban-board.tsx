"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { EngagementCard } from "@/components/engagement-card";
import { changeStageFromKanbanAction } from "@/app/(app)/actions";
import {
  KANBAN_STAGES,
  SECONDARY_STAGES,
  STAGE_LABELS,
} from "@/lib/constants";
import type { Engagement, PipelineStage } from "@/lib/types";
import { cn } from "@/lib/utils";

type StageMap = Record<PipelineStage, Engagement[]>;

function groupByStage(engagements: Engagement[]): StageMap {
  const empty = {} as StageMap;
  ([...KANBAN_STAGES, ...SECONDARY_STAGES] as PipelineStage[]).forEach((s) => {
    empty[s] = [];
  });
  for (const e of engagements) {
    if (!empty[e.stage]) empty[e.stage] = [];
    empty[e.stage].push(e);
  }
  return empty;
}

function Column({
  stage,
  engagements,
  collapsed,
}: {
  stage: PipelineStage;
  engagements: Engagement[];
  collapsed?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-lg border border-gray-200 bg-white p-3 shadow-sm",
        collapsed ? "min-w-[200px]" : "min-w-[260px]",
        isOver && "ring-2 ring-brand ring-offset-2",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              collapsed ? "bg-gray-300" : "bg-gray-400",
            )}
          />
          <h3 className="text-sm font-medium text-gray-700">
            {STAGE_LABELS[stage]}
          </h3>
        </div>
        <span className="text-xs text-gray-400">{engagements.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {engagements.length === 0 ? (
          <p className="px-1 py-4 text-xs text-gray-400">Ingen klienter</p>
        ) : (
          engagements.map((e) => (
            <EngagementCard key={e.slug} engagement={e} />
          ))
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({
  engagements: initial,
}: {
  engagements: Engagement[];
}) {
  const [engagements, setEngagements] = useState(initial);
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const grouped = useMemo(() => groupByStage(engagements), [engagements]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const slug = active.id as string;
    const newStage = over.id as PipelineStage;

    const current = engagements.find((e) => e.slug === slug);
    if (!current || current.stage === newStage) return;

    // Optimistic update
    setEngagements((prev) =>
      prev.map((e) => (e.slug === slug ? { ...e, stage: newStage } : e)),
    );

    startTransition(async () => {
      await changeStageFromKanbanAction(slug, newStage);
    });
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {KANBAN_STAGES.map((stage) => (
          <Column
            key={stage}
            stage={stage}
            engagements={grouped[stage] ?? []}
          />
        ))}
        {SECONDARY_STAGES.map((stage) => (
          <Column
            key={stage}
            stage={stage}
            engagements={grouped[stage] ?? []}
            collapsed
          />
        ))}
      </div>
    </DndContext>
  );
}
