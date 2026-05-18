import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1>Ikke funnet</h1>
      <p className="mt-2 text-sm text-gray-500">
        Siden du leter etter eksisterer ikke.
      </p>
      <p className="mt-4">
        <Link href="/" className="text-brand hover:underline">
          Tilbake til Pipeline
        </Link>
      </p>
    </div>
  );
}
