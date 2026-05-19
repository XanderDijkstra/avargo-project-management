import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

import { ServiceBadge } from "@/components/ui/service-badge";
import { getSop, listSops } from "@/lib/sops";

export const dynamic = "force-dynamic";

export default async function SopDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [sop, allSops] = await Promise.all([getSop(slug), listSops()]);
  if (!sop) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/sops"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Alle SOPs
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_240px]">
        <article className="prose-avargo max-w-none space-y-4">
          {sop.service && <ServiceBadge service={sop.service} />}
          <div className="space-y-4 text-sm leading-relaxed text-gray-800 [&_h1]:mb-2 [&_h1]:mt-2 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-medium [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:leading-relaxed [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-6">
            <ReactMarkdown>{sop.content}</ReactMarkdown>
          </div>
        </article>

        <aside className="space-y-2">
          <h3>Andre SOPs</h3>
          <ul className="space-y-1.5 text-sm">
            {allSops.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/sops/${s.slug}`}
                  className={
                    s.slug === slug
                      ? "text-gray-900 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
