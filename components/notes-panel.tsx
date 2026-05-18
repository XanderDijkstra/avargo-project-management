import { addNoteAction } from "@/app/(app)/clients/[slug]/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Note } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function NotesPanel({ slug, notes }: { slug: string; notes: Note[] }) {
  const sorted = [...notes].sort((a, b) => b.date.localeCompare(a.date));
  const addNote = addNoteAction.bind(null, slug);

  return (
    <section className="space-y-4">
      <h2>Notater</h2>

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500">Ingen notater enda.</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((note) => (
            <li
              key={note.id}
              className="rounded-md border border-gray-200 bg-white p-4"
            >
              <div className="mb-1 text-xs text-gray-500">
                {formatDateTime(note.date)}
              </div>
              <div className="whitespace-pre-wrap text-sm text-gray-900">
                {note.content}
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={addNote} className="space-y-2">
        <Textarea
          name="content"
          placeholder="Skriv et notat…"
          required
          rows={3}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm">
            Lagre
          </Button>
        </div>
      </form>
    </section>
  );
}
