import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const baseStyles =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium " +
  "transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-700 text-white shadow-sm hover:bg-emerald-800 focus-visible:outline-emerald-500",
  secondary:
    "border border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 focus-visible:outline-neutral-500",
  danger:
    "border border-red-900/60 bg-neutral-900 text-red-400 hover:bg-red-950 focus-visible:outline-red-500",
  ghost:
    "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 focus-visible:outline-neutral-500",
};

export default function Button({
  variant = "secondary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    />
  );
}
