import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function Card({
  title,
  description,
  action,
  children,
  className,
}: CardProps) {
  return (
    <section
      className={cn(
        "min-w-0 wrap-anywhere rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-neutral-50">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-neutral-400">{description}</p>
          )}
        </div>
        {action}
      </div>

      {children}
    </section>
  );
}
