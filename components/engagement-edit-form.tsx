"use client";

import { useState, useTransition } from "react";

import { updateEngagementAction } from "@/app/engagements/[slug]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  ALL_SERVICES,
  ALL_SOURCES,
  SERVICE_LABELS,
  SOURCE_LABELS,
} from "@/lib/constants";
import type { Engagement } from "@/lib/types";

export function EngagementEditForm({ engagement }: { engagement: Engagement }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!editing) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setEditing(true)}
      >
        Rediger
      </Button>
    );
  }

  const onSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updateEngagementAction(engagement.slug, formData);
      setEditing(false);
    });
  };

  return (
    <form
      action={onSubmit}
      className="space-y-4 rounded-lg border border-gray-200 bg-white p-5"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="companyName">Selskapsnavn</Label>
          <Input
            id="companyName"
            name="companyName"
            defaultValue={engagement.companyName}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="contactName">Kontaktnavn</Label>
          <Input
            id="contactName"
            name="contactName"
            defaultValue={engagement.contactName}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="contactEmail">E-post</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={engagement.contactEmail}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="contactPhone">Telefon</Label>
          <Input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            defaultValue={engagement.contactPhone ?? ""}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="source">Kilde</Label>
          <Select
            id="source"
            name="source"
            defaultValue={engagement.source}
          >
            {ALL_SOURCES.map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="sourceContact">Kontaktperson hos kilde</Label>
          <Input
            id="sourceContact"
            name="sourceContact"
            defaultValue={engagement.sourceContact ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tjenester</Label>
        <div className="flex flex-wrap gap-3">
          {ALL_SERVICES.map((s) => (
            <label
              key={s}
              className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-sm"
            >
              <input
                type="checkbox"
                name={`service-${s}`}
                defaultChecked={engagement.services.includes(s)}
              />
              {SERVICE_LABELS[s]}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="setupFee">Setup-honorar (NOK)</Label>
          <Input
            id="setupFee"
            name="setupFee"
            type="number"
            min="0"
            defaultValue={engagement.setupFee ?? ""}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="monthlyRetainer">Månedlig retainer (NOK)</Label>
          <Input
            id="monthlyRetainer"
            name="monthlyRetainer"
            type="number"
            min="0"
            defaultValue={engagement.monthlyRetainer ?? ""}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="adGoogle">Annonsebudsjett Google (NOK / mnd)</Label>
          <Input
            id="adGoogle"
            name="adGoogle"
            type="number"
            min="0"
            defaultValue={engagement.adBudget?.google ?? ""}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="adMeta">Annonsebudsjett Meta (NOK / mnd)</Label>
          <Input
            id="adMeta"
            name="adMeta"
            type="number"
            min="0"
            defaultValue={engagement.adBudget?.meta ?? ""}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setEditing(false)}
        >
          Avbryt
        </Button>
        <Button type="submit" disabled={pending}>
          Lagre
        </Button>
      </div>
    </form>
  );
}
