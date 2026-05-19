"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  addTaskAction,
  deleteTaskAction,
  regenerateTemplateTasksAction,
  updateTaskStatusAction,
} from "@/app/(app)/clients/[slug]/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ALL_TASK_STATUSES,
  ALL_WORKSTREAMS,
  TASK_STATUS_LABELS,
  WORKSTREAM_LABELS,
} from "@/lib/constants";
import type { PipelineStage, Task, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLUMN_TONE: Record<TaskStatus, string> = {
  todo: "bg-gray-300",
  doing: "bg-blue-400",
  done: "bg-emerald-400",
  blocked: "bg-amber-400",
};

function TaskCard({
  task,
  onDelete,
  disabled,
}: {
  task: Task;
  onDelete: (id: string) => void;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group cursor-grab rounded-md border border-gray-200 bg-white p-3 text-sm shadow-sm transition-colors hover:border-gray-300 active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium leading-snug text-gray-900">{task.title}</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={disabled}
          className="shrink-0 text-xs text-gray-300 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100 disabled:opacity-30"
          aria-label={`Slett ${task.title}`}
        >
          ✕
        </button>
      </div>
      {task.description && (
        <p className="mt-1 line-clamp-3 text-xs text-gray-500">
          {task.description}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between gap-2">
        <Badge variant="muted" className="text-[10px]">
          {WORKSTREAM_LABELS[task.workstream]}
        </Badge>
        {task.fromTemplate && (
          <span className="text-[10px] text-gray-400">Mal</span>
        )}
      </div>
    </div>
  );
}

function Column({
  status,
  tasks,
  onDelete,
  disabled,
}: {
  status: TaskStatus;
  tasks: Task[];
  onDelete: (id: string) => void;
  disabled: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-w-[260px] flex-1 flex-col rounded-lg border border-gray-200 bg-gray-50 p-3",
        isOver && "ring-2 ring-brand ring-offset-2",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", COLUMN_TONE[status])} />
          <h3 className="text-sm font-medium text-gray-700">
            {TASK_STATUS_LABELS[status]}
          </h3>
        </div>
        <span className="text-xs text-gray-400">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <p className="px-1 py-4 text-xs text-gray-400">Ingen oppgaver</p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDelete}
              disabled={disabled}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function TaskKanban({
  slug,
  tasks: initial,
  stage,
}: {
  slug: string;
  tasks: Task[];
  stage: PipelineStage;
}) {
  const [tasks, setTasks] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  useEffect(() => {
    setTasks(initial);
  }, [initial]);

  const grouped = useMemo(() => {
    const map = new Map<TaskStatus, Task[]>();
    for (const s of ALL_TASK_STATUSES) map.set(s, []);
    for (const t of tasks) {
      const arr = map.get(t.status) ?? [];
      arr.push(t);
      map.set(t.status, arr);
    }
    return map;
  }, [tasks]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    if (!ALL_TASK_STATUSES.includes(newStatus)) return;

    const current = tasks.find((t) => t.id === taskId);
    if (!current || current.status === newStatus) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    startTransition(async () => {
      await updateTaskStatusAction(slug, taskId, newStatus);
    });
  };

  const onDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    startTransition(async () => {
      await deleteTaskAction(slug, taskId);
    });
  };

  const onRegenerate = () => {
    startTransition(async () => {
      await regenerateTemplateTasksAction(slug);
    });
  };

  const onAdd = (formData: FormData) => {
    startTransition(async () => {
      await addTaskAction(slug, formData);
      setAdding(false);
    });
  };

  const total = tasks.length;
  const done = grouped.get("done")?.length ?? 0;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h2>Oppgaver</h2>
          {total > 0 && (
            <span className="text-xs text-gray-500">
              {done} av {total} fullført
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={pending}
            className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-50"
          >
            Regenerer maler
          </button>
          {!adding && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setAdding(true)}
            >
              Legg til oppgave
            </Button>
          )}
        </div>
      </div>

      {total === 0 && stage !== "bygging" && (
        <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-700">
            Oppgaver genereres automatisk når klienten flyttes til{" "}
            <span className="font-medium">«Bygging»</span>.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Du kan også legge til oppgaver manuelt nå.
          </p>
        </div>
      )}

      {adding && (
        <form
          action={onAdd}
          className="space-y-3 rounded-md border border-gray-200 bg-white p-4"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
            <div className="space-y-1">
              <Label htmlFor="task-title">Tittel</Label>
              <Input id="task-title" name="title" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="task-workstream">Arbeidsstrøm</Label>
              <Select
                id="task-workstream"
                name="workstream"
                defaultValue="general"
              >
                {ALL_WORKSTREAMS.map((w) => (
                  <option key={w} value={w}>
                    {WORKSTREAM_LABELS[w]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="task-description">Beskrivelse (valgfritt)</Label>
            <Textarea id="task-description" name="description" rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAdding(false)}
            >
              Avbryt
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              Lagre
            </Button>
          </div>
        </form>
      )}

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {ALL_TASK_STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={grouped.get(status) ?? []}
              onDelete={onDelete}
              disabled={pending}
            />
          ))}
        </div>
      </DndContext>
    </section>
  );
}
