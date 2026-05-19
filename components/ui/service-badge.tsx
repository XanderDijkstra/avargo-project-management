import { Badge } from "@/components/ui/badge";
import { SERVICE_LABELS } from "@/lib/constants";
import type { Service } from "@/lib/types";
import { cn } from "@/lib/utils";

// Per-service colour scheme. Classes are written out fully so Tailwind's
// JIT picks them up without needing a safelist.
const SERVICE_COLORS: Record<Service, string> = {
  website: "bg-purple-100 text-purple-800 ring-1 ring-purple-200/60",
  gbp: "bg-orange-100 text-orange-800 ring-1 ring-orange-200/60",
  "google-ads": "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200/60",
  "meta-ads": "bg-sky-100 text-sky-800 ring-1 ring-sky-200/60",
  linkedin: "bg-blue-900 text-white",
  software: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/60",
};

const SERVICE_DOT_COLORS: Record<Service, string> = {
  website: "bg-purple-500",
  gbp: "bg-orange-500",
  "google-ads": "bg-yellow-500",
  "meta-ads": "bg-sky-500",
  linkedin: "bg-blue-900",
  software: "bg-emerald-500",
};

export function ServiceDot({
  service,
  className,
}: {
  service: Service;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-full",
        SERVICE_DOT_COLORS[service],
        className,
      )}
      aria-hidden
    />
  );
}

export function ServiceBadge({
  service,
  className,
}: {
  service: Service;
  className?: string;
}) {
  return (
    <Badge className={cn(SERVICE_COLORS[service], className)}>
      {SERVICE_LABELS[service]}
    </Badge>
  );
}
