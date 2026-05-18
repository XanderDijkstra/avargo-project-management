"use client";

import { useState, useTransition } from "react";

import { deleteClientFromListAction } from "@/app/(app)/actions";

export function ClientRowDelete({
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
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setConfirming(true);
        }}
        className="text-xs text-gray-400 hover:text-red-600"
        aria-label={`Slett ${companyName}`}
      >
        Slett
      </button>
    );
  }

  const onConfirm = () => {
    startTransition(() => {
      deleteClientFromListAction(slug);
    });
  };

  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setConfirming(false);
        }}
        disabled={pending}
        className="text-gray-500 hover:text-gray-900 disabled:opacity-50"
      >
        Avbryt
      </button>
      <span className="text-gray-300">·</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onConfirm();
        }}
        disabled={pending}
        className="font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        Bekreft
      </button>
    </span>
  );
}
