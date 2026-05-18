import * as React from "react";
import { cn } from "@/lib/utils";

// Renders a friendly error/setup screen instead of letting Next.js show
// "Application error". Use whenever a data read might fail because Supabase
// isn't configured yet.
export function SetupError({
  title,
  message,
  className,
}: {
  title?: string;
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-amber-200 bg-amber-50 p-6",
        className,
      )}
    >
      <h2 className="text-amber-900">{title ?? "Kunne ikke laste data"}</h2>
      <p className="mt-2 text-sm text-amber-800">
        Sjekk at{" "}
        <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs">
          SUPABASE_URL
        </code>{" "}
        og{" "}
        <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs">
          SUPABASE_SERVICE_ROLE_KEY
        </code>{" "}
        er satt i Vercel, og at <code>supabase/setup.sql</code> er kjørt i
        Supabase SQL Editor.
      </p>
      <details className="mt-3 text-xs text-amber-900">
        <summary className="cursor-pointer">Tekniske detaljer</summary>
        <pre className="mt-2 max-w-full overflow-x-auto whitespace-pre-wrap rounded bg-amber-100 p-3">
          {message}
        </pre>
      </details>
    </div>
  );
}
