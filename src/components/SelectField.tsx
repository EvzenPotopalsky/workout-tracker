import { useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hideLabel?: boolean;
  containerClassName?: string;
  children: ReactNode;
};

export default function SelectField({
  label,
  hideLabel = false,
  className,
  containerClassName,
  id,
  children,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className={cn("min-w-0", containerClassName)}>
      <label
        htmlFor={selectId}
        className={cn(
          "mb-1 block text-sm font-medium text-neutral-300",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </label>

      <select
        id={selectId}
        className={cn(
          "min-w-0 max-w-full w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 shadow-sm",
          "focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
