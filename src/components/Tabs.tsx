import { useRef } from "react";
import { cn } from "@/lib/cn";

export type Tab = { id: string; label: string };
type TabsProps = {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
};

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  return (
    <div
      role="tablist"
      aria-label="Sections"
      className="flex gap-1 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/60 p-1"
    >
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={(element) => {
            buttons.current[index] = element;
          }}
          id={`tab-${tab.id}`}
          type="button"
          role="tab"
          aria-selected={tab.id === activeTab}
          aria-controls={`panel-${tab.id}`}
          tabIndex={tab.id === activeTab ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={(event) => {
            let next: number;
            if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
            else if (event.key === "ArrowLeft")
              next = (index - 1 + tabs.length) % tabs.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = tabs.length - 1;
            else return;
            event.preventDefault();
            onChange(tabs[next].id);
            buttons.current[next]?.focus();
          }}
          className={cn(
            "shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400",
            tab.id === activeTab
              ? "bg-emerald-700 text-white shadow-sm"
              : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
