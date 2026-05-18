"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ALL_FORM_TYPES, FORM_TYPE_LABELS } from "@/lib/constants";
import type { FormType } from "@/lib/types";

export function FormLinkGenerator({ slug }: { slug: string }) {
  const [formType, setFormType] = useState<FormType>("website");
  const [origin, setOrigin] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const url = `${origin || ""}/f/e/${slug}/${formType}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard might be unavailable in non-secure contexts; ignore.
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select
          value={formType}
          onChange={(e) => setFormType(e.target.value as FormType)}
          className="h-9 max-w-[220px]"
          aria-label="Velg skjematype"
        >
          {ALL_FORM_TYPES.map((t) => (
            <option key={t} value={t}>
              {FORM_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCopy}
          disabled={!origin}
        >
          {copied ? "Kopiert!" : "Kopier lenke"}
        </Button>
      </div>
      <code className="block break-all rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-700">
        {url}
      </code>
    </div>
  );
}
