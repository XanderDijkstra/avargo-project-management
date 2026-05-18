"use client";

import { useMemo, useState, useTransition } from "react";

import {
  addTaskAction,
  deleteTaskAction,
  regenerateTemplateTasksAction,
  updateTaskStatusAction,
} from "@/app/engagements/[slug]/actions";
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
import type { Task, TaskStatus, Workstream } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TasksPanel({
  slug,
  tasks,
}: {
  slug: string;
  tasks: Task[];
}) {
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();

  const grouped = useMemo(() => {
    const map = new Map<Workstream, Task[]>();
    for (const ws of ALL_WORKSTREAMS) map.set(ws, []);
    for (const t of tasks) {
      const arr = map.get(t.workstream) ?? [];
      arr.push(t);
      map.set(t.workstream, arr);
    }
    return map;
  }, [tasks]);

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;

  const onChangeStatus = (taskId: string, status: TaskStatus) => {
    startTransition(() => {
      updateTaskStatusAction(slug, taskId, status);
    });
  };

  const onDelete = (taskId: string) => {
    startTransition(() => {
      deleteTaskAction(slug, taskId);
    });
  };

  const onRegenerate = () => {
    startTransition(() => {
      regenerateTemplateTasksAction(slug);
    });
  };

  const onAdd = (formData: FormData) => {
    startTransition(async () => {
      await addTaskAction(slug, formData);
      setAdding(false);
    });
  };

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

      {adding && (
        <form
          action={onAdd}
          className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4"
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
            <Textarea
              id="task-description"
              name="description"
              rows={2}
            />
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

      {total === 0 ? (
        <p className="text-sm text-gray-500">
          Ingen oppgaver enda. Oppgaver opprettes automatisk når engasjementet
          går inn i stadiet «Bygging».
        </p>
      ) : (
        <div className="space-y-5">
          {ALL_WORKSTREAMS.map((ws) => {
            const wsTasks = grouped.get(ws) ?? [];
            if (wsTasks.length === 0) return null;
            const wsDone = wsTasks.filter((t) => t.status === "done").length;
            return (
              <div key={ws} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">
                    {WORKSTREAM_LABELS[ws]}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {wsDone}/{wsTasks.length}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {wsTasks.map((task) => (
                    <li
                      key={task.id}
                      className={cn(
                        "flex items-start gap-3 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm",
                        task.status === "done" && "opacity-60",
                      )}
                      title={task.description}
                    >
                      <input
                        type="checkbox"
                        checked={task.status === "done"}
                        onChange={(e) =>
                          onChangeStatus(
                            task.id,
                            e.target.checked ? "done" : "todo",
                          )
                        }
                        disabled={pending}
                        className="mt-0.5"
                        aria-label={`Marker ${task.title} som ferdig`}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-gray-900",
                            task.status === "done" && "line-through",
                          )}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <Select
                        value={task.status}
                        onChange={(e) =>
                          onChangeStatus(
                            task.id,
                            e.target.value as TaskStatus,
                          )
                        }
                        disabled={pending}
                        className="h-7 w-28 text-xs"
                      >
                        {ALL_TASK_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {TASK_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </Select>
                      <button
                        type="button"
                        onClick={() => onDelete(task.id)}
                        disabled={pending}
                        className="text-xs text-gray-400 hover:text-red-600 disabled:opacity-50"
                        aria-label={`Slett ${task.title}`}
                      >
                        Slett
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
