"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type TabKey = "info" | "tasks";

type Tab = {
  key: TabKey;
  label: string;
  badge?: string;
  content: ReactNode;
};

export function ClientPageTabs({
  infoContent,
  tasksContent,
  taskCount,
  taskDone,
}: {
  infoContent: ReactNode;
  tasksContent: ReactNode;
  taskCount: number;
  taskDone: number;
}) {
  const [active, setActive] = useState<TabKey>("info");

  const tabs: Tab[] = [
    { key: "info", label: "Info", content: infoContent },
    {
      key: "tasks",
      label: "Oppgaver",
      badge: taskCount > 0 ? `${taskDone}/${taskCount}` : undefined,
      content: tasksContent,
    },
  ];

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Klientvisning"
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
              {tab.badge && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                    isActive
                      ? "bg-blue-50 text-brand"
                      : "bg-gray-100 text-gray-500",
                  )}
                >
                  {tab.badge}
                </span>
              )}
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
