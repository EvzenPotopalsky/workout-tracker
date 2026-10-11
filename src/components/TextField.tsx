import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hideLabel?: boolean;
  containerClassName?: string;
};

export default function TextField({
  label,
  hideLabel = false,
  className,
  containerClassName,
  id,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={cn("min-w-0", containerClassName)}>
      <label
        htmlFor={inputId}
        className={cn(
          "mb-1 block text-sm font-medium text-neutral-300",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </label>

      <input
        id={inputId}
        className={cn(
          "min-w-0 max-w-full w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 shadow-sm",
          "placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500",
          className,
        )}
        {...props}
      />
    </div>
  );
}
