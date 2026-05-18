"use client";

import { useRef, useTransition } from "react";

import { addHourEntryAction } from "@/app/(app)/timeregister/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function HourEntryForm({
  clients,
}: {
  clients: { slug: string; companyName: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  const today = new Date().toISOString().slice(0, 10);

  const onSubmit = (formData: FormData) => {
    startTransition(async () => {
      await addHourEntryAction(formData);
      formRef.current?.reset();
    });
  };

  return (
    <form
      ref={formRef}
      action={onSubmit}
      className="space-y-4 rounded-lg border border-gray-200 bg-white p-5"
    >
      <h2>Loggfør timer</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="hr-client">Klient</Label>
          <Select id="hr-client" name="clientSlug" required defaultValue="">
            <option value="" disabled>
              Velg klient…
            </option>
            {clients.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.companyName}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="hr-date">Dato</Label>
          <Input
            id="hr-date"
            name="date"
            type="date"
            required
            defaultValue={today}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hr-hours">Timer</Label>
          <Input
            id="hr-hours"
            name="hours"
            type="number"
            min="0.25"
            step="0.25"
            required
            placeholder="1.5"
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="hr-note">Notat (valgfritt)</Label>
          <Textarea id="hr-note" name="note" rows={2} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          Loggfør
        </Button>
      </div>
    </form>
  );
}
