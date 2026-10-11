export function readStoredValue<T>(
  key: string,
  fallback: T,
  validate: (value: unknown) => value is T,
): { value: T; error: string | null } {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return { value: fallback, error: null };
    const parsed: unknown = JSON.parse(raw);
    if (!validate(parsed)) throw new Error("Unexpected saved data format");
    return { value: parsed, error: null };
  } catch {
    return {
      value: fallback,
      error: `Could not load saved ${key}. Using defaults for this session; existing data is kept until you edit it.`,
    };
  }
}
