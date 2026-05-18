import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avargo Project Management",
  description: "Internt CRM og pipeline-verktøy for Avargo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
