import { notFound } from "next/navigation";

import { ALL_FORM_TYPES } from "@/lib/constants";
import type { FormType } from "@/lib/types";

export default async function ThanksPage({
  params,
}: {
  params: Promise<{ formType: string }>;
}) {
  const { formType } = await params;
  if (!ALL_FORM_TYPES.includes(formType as FormType)) {
    notFound();
  }
  return (
    <div className="py-16 text-center">
      <h1>Takk!</h1>
      <p className="mt-3 text-sm text-gray-600">
        Vi har mottatt skjemaet ditt og tar kontakt innen kort tid.
      </p>
    </div>
  );
}
