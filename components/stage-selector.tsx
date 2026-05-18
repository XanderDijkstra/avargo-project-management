"use client";

import { useTransition } from "react";

import { changeStageAction } from "@/app/(app)/engagements/[slug]/actions";
import { Select } from "@/components/ui/select";
import { ALL_STAGES, STAGE_LABELS } from "@/lib/constants";
import type { PipelineStage } from "@/lib/types";

export function StageSelector({
  slug,
  current,
}: {
  slug: string;
  current: PipelineStage;
}) {
  const [pending, startTransition] = useTransition();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fd = new FormData();
    fd.set("stage", e.target.value);
    startTransition(() => {
      changeStageAction(slug, fd);
    });
  };

  return (
    <Select
      defaultValue={current}
      onChange={onChange}
      disabled={pending}
      className="w-56"
      aria-label="Endre stadium"
    >
      {ALL_STAGES.map((s) => (
        <option key={s} value={s}>
          {STAGE_LABELS[s]}
        </option>
      ))}
    </Select>
  );
}
