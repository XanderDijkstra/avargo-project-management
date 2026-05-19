"use client";

import { useRef, useState, useTransition } from "react";

import { addHourEntryAction } from "@/app/(app)/timeregister/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function HourEntryDialog({
  clients,
}: {
  clients: { slug: string; companyName: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const today = new Date().toISOString().slice(0, 10);

  const onSubmit = (formData: FormData) => {
    startTransition(async () => {
      await addHourEntryAction(formData);
      formRef.current?.reset();
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="h-12 px-6 text-base">
          + Loggfør timer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Loggfør timer</DialogTitle>
        </DialogHeader>

        <form ref={formRef} action={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
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

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={pending}>
              Loggfør
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
