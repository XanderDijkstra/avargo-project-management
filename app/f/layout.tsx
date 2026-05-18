export default function PublicFormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-8 text-center">
        <p className="text-sm font-semibold tracking-wide text-gray-500">
          AVARGO
        </p>
      </header>
      {children}
    </div>
  );
}
