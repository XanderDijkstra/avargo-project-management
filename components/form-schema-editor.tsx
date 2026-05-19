"use client";

import { useState, useTransition } from "react";

import {
  addFieldAction,
  addSectionAction,
  deleteFieldAction,
  deleteSectionAction,
  renameSectionAction,
  resetFormSchemaAction,
  updateFieldAction,
  updateFormMetaAction,
} from "@/app/(app)/services/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FormField, FormSchema } from "@/lib/form-schemas";
import type { FormType } from "@/lib/types";

const FIELD_TYPES: FormField["type"][] = [
  "text",
  "textarea",
  "email",
  "url",
  "number",
  "select",
  "multiselect",
  "tel",
];

const FIELD_TYPE_LABELS: Record<FormField["type"], string> = {
  text: "Tekst",
  textarea: "Lang tekst",
  email: "E-post",
  url: "URL",
  number: "Tall",
  select: "Nedtrekksmeny",
  multiselect: "Flervalg",
  tel: "Telefon",
};

function optionsToString(options: FormField["options"]): string {
  if (!options) return "";
  return options.map((o) => `${o.value}: ${o.label}`).join("\n");
}

export function FormSchemaEditor({
  formType,
  schema,
}: {
  formType: FormType;
  schema: FormSchema;
}) {
  const [pending, startTransition] = useTransition();

  const onUpdateMeta = (formData: FormData) => {
    startTransition(() => {
      updateFormMetaAction(formType, formData);
    });
  };

  const onAddSection = () => {
    const title = window.prompt("Tittel på ny seksjon");
    if (!title) return;
    startTransition(() => {
      addSectionAction(formType, title);
    });
  };

  const onRenameSection = (sectionIndex: number, current: string) => {
    const title = window.prompt("Ny tittel", current);
    if (!title || title === current) return;
    startTransition(() => {
      renameSectionAction(formType, sectionIndex, title);
    });
  };

  const onDeleteSection = (sectionIndex: number, title: string) => {
    if (!window.confirm(`Slette seksjonen «${title}»?`)) return;
    startTransition(() => {
      deleteSectionAction(formType, sectionIndex);
    });
  };

  const onReset = () => {
    if (
      !window.confirm(
        "Tilbakestille til standard-skjema? Eventuelle endringer går tapt.",
      )
    )
      return;
    startTransition(() => {
      resetFormSchemaAction(formType);
    });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2>Skjema-detaljer</h2>
          <button
            type="button"
            onClick={onReset}
            disabled={pending}
            className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-50"
          >
            Tilbakestill til standard
          </button>
        </div>

        <form action={onUpdateMeta} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="form-title">Tittel</Label>
            <Input
              id="form-title"
              name="title"
              defaultValue={schema.title}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="form-description">Beskrivelse</Label>
            <Textarea
              id="form-description"
              name="description"
              defaultValue={schema.description}
              rows={2}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={pending}>
              Lagre
            </Button>
          </div>
        </form>
      </section>

      {schema.sections.map((section, sectionIndex) => (
        <SectionCard
          key={`${sectionIndex}-${section.title}`}
          formType={formType}
          sectionIndex={sectionIndex}
          section={section}
          pending={pending}
          onRename={() => onRenameSection(sectionIndex, section.title)}
          onDelete={() => onDeleteSection(sectionIndex, section.title)}
        />
      ))}

      <div>
        <Button
          type="button"
          variant="secondary"
          onClick={onAddSection}
          disabled={pending}
        >
          + Legg til seksjon
        </Button>
      </div>
    </div>
  );
}

function SectionCard({
  formType,
  sectionIndex,
  section,
  pending,
  onRename,
  onDelete,
}: {
  formType: FormType;
  sectionIndex: number;
  section: FormSchema["sections"][number];
  pending: boolean;
  onRename: () => void;
  onDelete: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const onAdd = (formData: FormData) => {
    startTransition(async () => {
      await addFieldAction(formType, sectionIndex, formData);
      setAdding(false);
    });
  };

  const onUpdate = (fieldIndex: number, formData: FormData) => {
    startTransition(async () => {
      await updateFieldAction(formType, sectionIndex, fieldIndex, formData);
      setEditingIndex(null);
    });
  };

  const onDeleteField = (fieldIndex: number, label: string) => {
    if (!window.confirm(`Slette feltet «${label}»?`)) return;
    startTransition(() => {
      deleteFieldAction(formType, sectionIndex, fieldIndex);
    });
  };

  return (
    <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between gap-2">
        <h2>{section.title}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRename}
            disabled={pending}
            className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-50"
          >
            Endre tittel
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="text-xs text-gray-400 hover:text-red-600 disabled:opacity-50"
          >
            Slett seksjon
          </button>
        </div>
      </div>

      {section.fields.length === 0 ? (
        <p className="text-sm text-gray-500">Ingen felter enda.</p>
      ) : (
        <ul className="space-y-2">
          {section.fields.map((field, fieldIndex) => (
            <li key={`${fieldIndex}-${field.name}`}>
              {editingIndex === fieldIndex ? (
                <FieldForm
                  defaultValues={field}
                  onCancel={() => setEditingIndex(null)}
                  onSubmit={(fd) => onUpdate(fieldIndex, fd)}
                  pending={pending}
                />
              ) : (
                <div className="flex items-start justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {field.label}
                      </p>
                      <span className="text-[10px] uppercase tracking-wide text-gray-500">
                        {FIELD_TYPE_LABELS[field.type]}
                      </span>
                      {field.required && (
                        <span className="text-[10px] uppercase tracking-wide text-amber-700">
                          påkrevd
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-gray-500">
                      {field.name}
                    </p>
                    {field.helpText && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {field.helpText}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingIndex(fieldIndex)}
                      disabled={pending}
                      className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-50"
                    >
                      Rediger
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteField(fieldIndex, field.label)}
                      disabled={pending}
                      className="text-xs text-gray-400 hover:text-red-600 disabled:opacity-50"
                    >
                      Slett
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <FieldForm
          onCancel={() => setAdding(false)}
          onSubmit={onAdd}
          pending={pending}
        />
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setAdding(true)}
          disabled={pending}
        >
          + Legg til felt
        </Button>
      )}
    </section>
  );
}

function FieldForm({
  defaultValues,
  onSubmit,
  onCancel,
  pending,
}: {
  defaultValues?: FormField;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const [type, setType] = useState<FormField["type"]>(
    defaultValues?.type ?? "text",
  );
  const showOptions = type === "select" || type === "multiselect";

  return (
    <form
      action={onSubmit}
      className="space-y-3 rounded-md border border-gray-300 bg-white p-4"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="field-label">Spørsmål / etikett</Label>
          <Input
            id="field-label"
            name="label"
            defaultValue={defaultValues?.label}
            required
            autoFocus
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="field-name">Feltnavn (intern, ingen mellomrom)</Label>
          <Input
            id="field-name"
            name="name"
            defaultValue={defaultValues?.name}
            required
            pattern="[a-zA-Z][a-zA-Z0-9_]*"
            title="Bokstaver/tall/understrek, må begynne med en bokstav"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="field-type">Type</Label>
          <Select
            id="field-type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as FormField["type"])}
          >
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>
                {FIELD_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="required"
              defaultChecked={defaultValues?.required}
              className="h-4 w-4"
            />
            Påkrevd
          </label>
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="field-placeholder">Plassholder (valgfritt)</Label>
          <Input
            id="field-placeholder"
            name="placeholder"
            defaultValue={defaultValues?.placeholder}
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="field-helpText">Hjelpetekst (valgfritt)</Label>
          <Input
            id="field-helpText"
            name="helpText"
            defaultValue={defaultValues?.helpText}
          />
        </div>
        {showOptions && (
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="field-options">
              Valg (én per linje, format «verdi: etikett»)
            </Label>
            <Textarea
              id="field-options"
              name="options"
              rows={4}
              defaultValue={optionsToString(defaultValues?.options)}
              placeholder={"yes: Ja\nno: Nei"}
            />
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={pending}
        >
          Avbryt
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          Lagre
        </Button>
      </div>
    </form>
  );
}
