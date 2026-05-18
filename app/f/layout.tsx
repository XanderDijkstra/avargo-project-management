export default function PublicFormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto -mt-8 max-w-2xl pb-12">
      <header className="mb-8 text-center">
        <p className="text-sm font-semibold tracking-wide text-gray-500">
          AVARGO
        </p>
      </header>
      {children}
    </div>
  );
}
