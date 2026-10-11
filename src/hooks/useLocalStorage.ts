import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { readStoredValue } from "@/lib/storage";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validate: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>, string | null] {
  const [initial] = useState(() =>
    readStoredValue(key, initialValue, validate),
  );
  const [value, setValue] = useState<T>(initial.value);
  const [storageError, setStorageError] = useState<string | null>(
    initial.error,
  );

  useEffect(() => {
    if (initial.error && value === initial.value) return;

    /* eslint-disable react-hooks/set-state-in-effect */
    // Report the result of saving to browser storage in the UI.
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setStorageError(null);
    } catch {
      setStorageError(
        `Could not save ${key}. Changes are only in memory and may be lost when you close or reload this page.`,
      );
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [key, value, initial]);

  return [value, setValue, storageError];
}
