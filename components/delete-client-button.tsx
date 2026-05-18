"use client";

import { useState, useTransition } from "react";

import { deleteClientAction } from "@/app/(app)/clients/[slug]/actions";
import { Button } from "@/components/ui/button";

export function DeleteClientButton({
  slug,
  companyName,
}: {
  slug: string;
  companyName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setConfirming(true)}
        className="border-red-200 text-red-700 hover:bg-red-50"
      >
        Slett klient
      </Button>
    );
  }

  const onConfirm = () => {
    startTransition(() => {
      deleteClientAction(slug);
    });
  };

  return (
    <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-1.5">
      <span className="text-xs text-red-800">
        Slette «{companyName}» permanent?
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(false)}
        disabled={pending}
      >
        Avbryt
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={onConfirm}
        disabled={pending}
      >
        Ja, slett
      </Button>
    </div>
  );
}
