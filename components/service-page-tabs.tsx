"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tab = {
  key: string;
  label: string;
  content: ReactNode;
};

export function ServicePageTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState<string>(tabs[0]?.key ?? "");

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Tjenestevisning"
        className="flex gap-1 border-b border-gray-200"
      >
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setActive(tab.key)}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-brand text-brand"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.key}
          role="tabpanel"
          hidden={active !== tab.key}
          className={active === tab.key ? "block" : "hidden"}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
