// @vitest-environment jsdom
import { StrictMode, act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { useLocalStorage } from "./useLocalStorage";
import { isExerciseList } from "@/lib/validation";

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  localStorage.clear();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});
function Harness() {
  const [items, setItems, error] = useLocalStorage(
    "test-exercises",
    [],
    isExerciseList,
  );
  return (
    <>
      <span>{items.length}</span>
      <p role="alert">{error}</p>
      <button
        onClick={() =>
          setItems((current) => [...current, { id: "bench", name: "Bench" }])
        }
      >
        Add
      </button>
    </>
  );
}
async function mount() {
  await act(async () =>
    root.render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    ),
  );
}
async function click() {
  await act(async () => container.querySelector("button")!.click());
}
test.each(["{broken", "null", '{"wrong":"shape"}'])(
  "keeps unreadable stored data %s until an edit",
  async (raw) => {
    localStorage.setItem("test-exercises", raw);
    await mount();
    expect(container.textContent).toContain("Could not load");
    expect(localStorage.getItem("test-exercises")).toBe(raw);
    await click();
    expect(JSON.parse(localStorage.getItem("test-exercises")!)).toEqual([
      { id: "bench", name: "Bench" },
    ]);
    expect(container.textContent).not.toContain("Could not load");
  },
);
test("survives blocked storage reads", async () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new DOMException("blocked");
  });
  await mount();
  expect(container.textContent).toContain("Could not load");
});
test("reports failed writes, keeps memory state, and recovers on a later save", async () => {
  const save = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("quota");
  });
  await mount();
  await click();
  expect(container.querySelector("span")!.textContent).toBe("1");
  expect(container.textContent).toContain("only in memory");
  save.mockRestore();
  await click();
  expect(JSON.parse(localStorage.getItem("test-exercises")!)).toHaveLength(2);
  expect(container.textContent).not.toContain("only in memory");
});
