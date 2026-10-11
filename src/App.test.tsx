// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import App from "./App";
let root: Root;
let container: HTMLDivElement;
const exercises = [
  { id: "squat", name: "Squat" },
  { id: "bench", name: "Bench" },
];
const draft = {
  name: "Push",
  exercises: [
    { exerciseId: "bench", name: "Bench", sets: [{ weight: "0", reps: "5" }] },
  ],
};
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  localStorage.clear();
  localStorage.setItem("exercises", JSON.stringify(exercises));
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});
async function mount() {
  await act(async () => root.render(<App />));
}
async function click(text: string) {
  const button = Array.from(container.querySelectorAll("button")).find(
    (item) => item.textContent === text,
  );
  expect(button, `button ${text}`).toBeDefined();
  await act(async () => button!.click());
}
test("rejects blank weight without clearing the unfinished workout", async () => {
  const invalid = {
    ...draft,
    exercises: [{ ...draft.exercises[0], sets: [{ weight: "", reps: "5" }] }],
  };
  localStorage.setItem("currentWorkout", JSON.stringify(invalid));
  await mount();
  await click("Log");
  await click("Finish workout");
  expect(container.textContent).toContain("Enter a weight");
  expect(JSON.parse(localStorage.getItem("workouts")!)).toEqual([]);
  expect(JSON.parse(localStorage.getItem("currentWorkout")!)).toEqual(invalid);
});
test("finishes explicit zero-weight work and shows it in history", async () => {
  localStorage.setItem("currentWorkout", JSON.stringify(draft));
  await mount();
  await click("Log");
  await click("Finish workout");
  expect(container.querySelector('[aria-selected="true"]')!.textContent).toBe(
    "History",
  );
  expect(JSON.parse(localStorage.getItem("workouts")!)).toHaveLength(1);
  expect(JSON.parse(localStorage.getItem("currentWorkout")!)).toEqual({
    name: "",
    exercises: [],
  });
});
test("protects exercises used by the unfinished workout", async () => {
  localStorage.setItem("currentWorkout", JSON.stringify(draft));
  await mount();
  await click("Exercises");
  const row = Array.from(container.querySelectorAll("li")).find((item) =>
    item.textContent?.includes("Bench"),
  )!;
  await act(async () => row.querySelector("button")!.click());
  expect(container.textContent).toContain("used in your unfinished workout");
  expect(JSON.parse(localStorage.getItem("exercises")!)).toHaveLength(2);
});
test("reports a template with a missing exercise without crashing", async () => {
  localStorage.setItem(
    "templates",
    JSON.stringify([
      {
        id: "t",
        name: "Missing",
        exercises: [{ exerciseId: "missing", sets: 1 }],
      },
    ]),
  );
  await mount();
  await click("Log");
  await click("Start workout");
  expect(container.textContent).toContain("missing exercises");
  expect(container.textContent).not.toContain("Discard unfinished workout?");
});
test("supports arrow, Home and End tab keys with linked panels", async () => {
  await mount();
  for (const tab of container.querySelectorAll('[role="tab"]')) {
    expect(
      document.getElementById(tab.getAttribute("aria-controls")!),
    ).not.toBeNull();
  }
  const dashboard =
    container.querySelector<HTMLButtonElement>("#tab-dashboard")!;
  dashboard.focus();
  await act(async () =>
    dashboard.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    ),
  );
  expect(document.activeElement?.id).toBe("tab-log");
  expect(container.querySelector("#panel-log")!.hasAttribute("hidden")).toBe(
    false,
  );
  await act(async () =>
    document.activeElement!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "End", bubbles: true }),
    ),
  );
  expect(document.activeElement?.id).toBe("tab-exercises");
  await act(async () =>
    document.activeElement!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
    ),
  );
  expect(document.activeElement?.id).toBe("tab-dashboard");
});


test("preserves the saved draft when writing completed history fails, then retries", async () => {
  localStorage.setItem("currentWorkout", JSON.stringify(draft));
  await mount();
  await click("Log");
  const originalSetItem = Storage.prototype.setItem;
  const failingWrite = vi.spyOn(Storage.prototype, "setItem").mockImplementation(
    function (this: Storage, key, value) {
      if (key === "workouts")
        throw new DOMException("Full", "QuotaExceededError");
      originalSetItem.call(this, key, value);
    },
  );
  await click("Finish workout");
  expect(container.textContent).toContain("Your unfinished workout has been kept");
  expect(JSON.parse(localStorage.getItem("currentWorkout")!)).toEqual(draft);
  expect(JSON.parse(localStorage.getItem("workouts")!)).toEqual([]);
  expect(container.querySelector('[aria-selected="true"]')!.textContent).toBe(
    "Log",
  );
  failingWrite.mockRestore();
  await click("Finish workout");
  expect(JSON.parse(localStorage.getItem("workouts")!)).toHaveLength(1);
  expect(document.activeElement?.id).toBe("panel-history");
});

test("requires repairing missing exercise references before saving template edits", async () => {
  localStorage.setItem(
    "templates",
    JSON.stringify([
      { id: "missing", name: "Plan", exercises: [{ exerciseId: "gone", sets: 1 }] },
    ]),
  );
  await mount();
  await click("Log");
  await click("Edit template");
  await click("Save changes");
  expect(container.textContent).toContain("Remove or replace exercises");
  expect(container.textContent).toContain("Save changes");
});

test("keeps history expansion targets present and focus after deleting the last workout", async () => {
  localStorage.setItem(
    "workouts",
    JSON.stringify([{ ...draft, id: "saved", date: "2026-10-01T12:00:00Z" }]),
  );
  await mount();
  await click("History");
  const expander = container.querySelector<HTMLButtonElement>('[aria-expanded]')!;
  const details = document.getElementById(expander.getAttribute("aria-controls")!)!;
  expect(details).not.toBeNull();
  expect(details.hidden).toBe(true);
  await act(async () => expander.click());
  expect(details.hidden).toBe(false);
  await click("Delete");
  await click("Confirm");
  expect(document.activeElement?.id).toBe("panel-history");
  expect(container.textContent).toContain("No workouts logged yet");
});

test("loads demo charts and templates, persists after remount, and clears only samples", async () => {
  await mount();
  await click("Load demo data");
  expect(container.textContent).toContain("Volume trend");
  expect(JSON.parse(localStorage.getItem("workouts")!)).toHaveLength(9);
  expect(JSON.parse(localStorage.getItem("templates")!)).toHaveLength(3);
  // Reload the app using the same browser storage.
  await act(async () => root.unmount());
  root = createRoot(container);
  await mount();
  expect(container.textContent).toContain("You’re exploring demo data");
  await click("Log");
  const start = Array.from(container.querySelectorAll("button")).find(
    (button) => button.textContent === "Start workout",
  )!;
  await act(async () => start.click());
  expect(JSON.parse(localStorage.getItem("currentWorkout")!).exercises).toHaveLength(3);
  await click("Clear demo data");
  await click("Cancel");
  expect(JSON.parse(localStorage.getItem("workouts")!)).toHaveLength(9);
  await click("Clear demo data");
  await click("Confirm removal");
  expect(JSON.parse(localStorage.getItem("workouts")!)).toEqual([]);
  expect(JSON.parse(localStorage.getItem("templates")!)).toEqual([]);
  expect(JSON.parse(localStorage.getItem("currentWorkout")!).exercises).toHaveLength(3);
  expect(JSON.parse(localStorage.getItem("exercises")!).some(
    (exercise: { id: string }) => exercise.id === "bench",
  )).toBe(true);
});

test.each(["workouts", "templates", "currentWorkout"])(
  "does not offer demo loading when %s contains user data",
  async (key) => {
    const saved = key === "workouts"
      ? [{ ...draft, id: "mine", date: "2026-10-01T12:00:00Z" }]
      : key === "templates"
        ? [{ id: "mine", name: "My plan", exercises: [{ exerciseId: "bench", sets: 3 }] }]
        : draft;
    localStorage.setItem(key, JSON.stringify(saved));
    await mount();
    expect(container.textContent).not.toContain("Load demo data");
    expect(JSON.parse(localStorage.getItem(key)!)).toEqual(saved);
  },
);

test("clearing samples preserves newly saved personal workouts and templates", async () => {
  await mount();
  await click("Load demo data");
  // Simulate personal data saved alongside the samples, then reload.
  await act(async () => root.unmount());
  const savedWorkouts = JSON.parse(localStorage.getItem("workouts")!);
  const savedTemplates = JSON.parse(localStorage.getItem("templates")!);
  const personalWorkout = { ...draft, id: "mine", date: "2026-10-01T12:00:00Z" };
  const personalTemplate = { id: "mine", name: "My plan", exercises: [{ exerciseId: "bench", sets: 3 }] };
  localStorage.setItem("workouts", JSON.stringify([...savedWorkouts, personalWorkout]));
  localStorage.setItem("templates", JSON.stringify([...savedTemplates, personalTemplate]));
  root = createRoot(container);
  await mount();
  await click("Clear demo data");
  await click("Confirm removal");
  expect(JSON.parse(localStorage.getItem("workouts")!)).toEqual([personalWorkout]);
  expect(JSON.parse(localStorage.getItem("templates")!)).toEqual([personalTemplate]);
});
