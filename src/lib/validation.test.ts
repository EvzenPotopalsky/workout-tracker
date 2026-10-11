import { describe, expect, test } from "vitest";
import {
  isValidSet,
  validateWorkout,
  isExerciseList,
  isCurrentWorkout,
  isWorkoutList,
  isTemplateList,
} from "./validation";

const exercise = {
  exerciseId: "bench",
  name: "Bench",
  sets: [{ weight: "0", reps: "5" }],
};
describe("finishing a workout", () => {
  test.each(["", "  ", "-1", "Infinity", "abc"])(
    "rejects weight %j",
    (weight) => {
      expect(isValidSet({ weight, reps: "5" })).toBe(false);
    },
  );
  test.each(["", "0", "-1", "1.5", "abc"])("rejects reps %j", (reps) => {
    expect(isValidSet({ weight: "10", reps })).toBe(false);
  });
  test("allows explicit zero and fractional weights", () => {
    expect(isValidSet({ weight: "0", reps: "5" })).toBe(true);
    expect(isValidSet({ weight: "12.25", reps: "5" })).toBe(true);
  });
  test("requires a name, exercises and sets", () => {
    expect(
      validateWorkout({ name: " ", exercises: [exercise] }),
    ).not.toBeNull();
    expect(validateWorkout({ name: "Push", exercises: [] })).not.toBeNull();
    expect(
      validateWorkout({ name: "Push", exercises: [{ ...exercise, sets: [] }] }),
    ).not.toBeNull();
    expect(validateWorkout({ name: "Push", exercises: [exercise] })).toBeNull();
  });
});
describe("stored data shape", () => {
  test.each([null, {}, "oops", 1])("rejects invalid root %j", (value) => {
    expect(isExerciseList(value)).toBe(false);
    expect(isCurrentWorkout(value)).toBe(false);
    expect(isWorkoutList(value)).toBe(false);
    expect(isTemplateList(value)).toBe(false);
  });
  test("accepts an unfinished draft with blank fields", () => {
    expect(
      isCurrentWorkout({
        name: "",
        exercises: [{ ...exercise, sets: [{ weight: "", reps: "" }] }],
      }),
    ).toBe(true);
  });
  test("rejects malformed nested sets and invalid dates", () => {
    expect(
      isCurrentWorkout({
        name: "Push",
        exercises: [{ ...exercise, sets: [null] }],
      }),
    ).toBe(false);
    expect(
      isWorkoutList([
        { id: "a", name: "Push", date: "bad", exercises: [exercise] },
      ]),
    ).toBe(false);
  });
  test("bounds template set counts", () => {
    for (const sets of [0, -1, 1.5, 101]) {
      expect(
        isTemplateList([
          { id: "a", name: "Push", exercises: [{ exerciseId: "bench", sets }] },
        ]),
      ).toBe(false);
    }
  });
});
