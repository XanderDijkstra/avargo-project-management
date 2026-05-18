import Link from "next/link";

import { createEngagementAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  ALL_SERVICES,
  ALL_SOURCES,
  KANBAN_STAGES,
  SERVICE_LABELS,
  SOURCE_LABELS,
  STAGE_LABELS,
} from "@/lib/constants";

export function EngagementForm() {
  return (
    <form action={createEngagementAction} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="companyName">Selskapsnavn *</Label>
          <Input id="companyName" name="companyName" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="contactName">Kontaktnavn *</Label>
          <Input id="contactName" name="contactName" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="contactEmail">E-post *</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="contactPhone">Telefon</Label>
          <Input id="contactPhone" name="contactPhone" type="tel" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="source">Kilde</Label>
          <Select id="source" name="source" defaultValue="Riktig Regnskap">
            {ALL_SOURCES.map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="sourceContact">Kontaktperson hos kilde</Label>
          <Input id="sourceContact" name="sourceContact" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="stage">Stadium</Label>
          <Select id="stage" name="stage" defaultValue="henvisning-mottatt">
            {KANBAN_STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABELS[s]}
              </option>
            ))}
          </Select>
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
              <input type="checkbox" name={`service-${s}`} />
              {SERVICE_LABELS[s]}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="setupFee">Setup-honorar (NOK)</Label>
          <Input id="setupFee" name="setupFee" type="number" min="0" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="monthlyRetainer">Månedlig retainer (NOK)</Label>
          <Input
            id="monthlyRetainer"
            name="monthlyRetainer"
            type="number"
            min="0"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="adGoogle">Annonsebudsjett Google (NOK / mnd)</Label>
          <Input id="adGoogle" name="adGoogle" type="number" min="0" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="adMeta">Annonsebudsjett Meta (NOK / mnd)</Label>
          <Input id="adMeta" name="adMeta" type="number" min="0" />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button asChild variant="ghost">
          <Link href="/">Avbryt</Link>
        </Button>
        <Button type="submit">Opprett engasjement</Button>
      </div>
    </form>
  );
}
