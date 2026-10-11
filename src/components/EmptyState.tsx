export default function EmptyState({ children }: { children: string }) {
  return (
    <p className="rounded-lg border border-dashed border-neutral-700 py-6 text-center text-sm text-neutral-400">
      {children}
    </p>
  );
}
