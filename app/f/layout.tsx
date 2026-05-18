export default function PublicFormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10 md:py-16">
        <header className="mb-6 text-center">
          <p className="text-sm font-semibold tracking-wide text-gray-500">
            AVARGO
          </p>
        </header>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
