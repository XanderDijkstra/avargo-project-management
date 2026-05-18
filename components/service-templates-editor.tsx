"use client";

import { useState, useTransition } from "react";

import {
  addServiceTemplateAction,
  removeServiceTemplateAction,
} from "@/app/(app)/services/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Service, ServiceTemplate } from "@/lib/types";

export function ServiceTemplatesEditor({
  service,
  templates,
}: {
  service: Service;
  templates: ServiceTemplate["templates"];
}) {
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();

  const onAdd = (formData: FormData) => {
    startTransition(async () => {
      await addServiceTemplateAction(service, formData);
      setAdding(false);
    });
  };

  const onRemove = (index: number) => {
    startTransition(() => {
      removeServiceTemplateAction(service, index);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>Mal-oppgaver</h2>
        {!adding && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setAdding(true)}
          >
            Legg til oppgave
          </Button>
        )}
      </div>

      {adding && (
        <form
          action={onAdd}
          className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4"
        >
          <div className="space-y-1">
            <Label htmlFor="tpl-title">Tittel</Label>
            <Input id="tpl-title" name="title" required autoFocus />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tpl-description">Beskrivelse (valgfritt)</Label>
            <Textarea id="tpl-description" name="description" rows={2} />
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

      {templates.length === 0 ? (
        <p className="text-sm text-gray-500">
          Ingen mal-oppgaver enda. Legg til den første.
        </p>
      ) : (
        <ul className="space-y-2">
          {templates.map((t, i) => (
            <li
              key={`${i}-${t.title}`}
              className="flex items-start justify-between gap-3 rounded-md border border-gray-200 bg-white px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-gray-500">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemove(i)}
                disabled={pending}
                className="text-xs text-gray-400 hover:text-red-600 disabled:opacity-50"
                aria-label={`Fjern ${t.title}`}
              >
                Fjern
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
