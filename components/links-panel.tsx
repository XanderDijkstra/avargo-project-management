"use client";

import { useState, useTransition } from "react";

import {
  addLinkAction,
  removeLinkAction,
} from "@/app/(app)/clients/[slug]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Link as LinkType } from "@/lib/types";

export function LinksPanel({
  slug,
  links,
}: {
  slug: string;
  links: LinkType[];
}) {
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();

  const onAdd = (formData: FormData) => {
    startTransition(async () => {
      await addLinkAction(slug, formData);
      setAdding(false);
    });
  };

  const onRemove = (label: string) => {
    startTransition(async () => {
      await removeLinkAction(slug, label);
    });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3>Lenker</h3>
        {!adding && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAdding(true)}
          >
            Legg til
          </Button>
        )}
      </div>

      {links.length === 0 ? (
        <p className="text-sm text-gray-500">Ingen lenker.</p>
      ) : (
        <ul className="space-y-1.5">
          {links.map((l) => (
            <li
              key={l.label}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="truncate text-brand hover:underline"
                title={l.url}
              >
                {l.label}
              </a>
              <button
                type="button"
                onClick={() => onRemove(l.label)}
                disabled={pending}
                className="text-xs text-gray-400 hover:text-red-600 disabled:opacity-50"
                aria-label={`Fjern ${l.label}`}
              >
                Fjern
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <form action={onAdd} className="space-y-2 rounded-md border border-gray-200 p-3">
          <Input name="label" placeholder="Etikett" required />
          <Input name="url" type="url" placeholder="https://…" required />
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
    </section>
  );
}
