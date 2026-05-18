"use client";

import { useDraggable } from "@dnd-kit/core";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  ALL_SERVICES,
  SERVICE_LABELS,
} from "@/lib/constants";
import type { Engagement } from "@/lib/types";
import { cn } from "@/lib/utils";

export function EngagementCard({ engagement }: { engagement: Engagement }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: engagement.slug });

  // Visual indicator if the engagement has missing economic info despite services.
  const missingEconomy =
    engagement.services.length > 0 &&
    engagement.setupFee == null &&
    engagement.monthlyRetainer == null;

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab rounded-md border border-gray-200 bg-gray-50 p-3 text-sm transition-colors hover:border-gray-300 hover:bg-white active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/clients/${engagement.slug}`}
          className="font-medium text-gray-900 hover:text-brand"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {engagement.companyName}
        </Link>
        {missingEconomy && (
          <span
            title="Ingen økonomi-tall registrert"
            className="h-2 w-2 shrink-0 rounded-full bg-amber-400"
          />
        )}
      </div>
      <p className="mt-0.5 text-xs text-gray-500">{engagement.contactName}</p>
      {engagement.services.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {engagement.services.map((s) => {
            // Defensive: skip services that aren't in the lookup
            if (!ALL_SERVICES.includes(s) && !(s in SERVICE_LABELS)) {
              return null;
            }
            return (
              <Badge key={s} variant="muted" className="text-[10px]">
                {SERVICE_LABELS[s] ?? s}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
