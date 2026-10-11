import { expect, test } from "vitest";
import { createDemoData, isDemoItem } from "./demoData";
import { isTemplateList, isWorkoutList, validateWorkout } from "./validation";

test("creates valid samples with recent dates and reusable exercise references", () => {
  const now = new Date("2026-10-11T10:00:00Z");
  const demo = createDemoData([{ id: "bench", name: "bench press" }], now);
  expect(demo.workouts).toHaveLength(9);
  expect(demo.templates).toHaveLength(3);
  expect(isWorkoutList(demo.workouts)).toBe(true);
  expect(isTemplateList(demo.templates)).toBe(true);
  expect(demo.exercises.filter((exercise) => exercise.name.toLowerCase() === "bench press")).toHaveLength(1);
  expect(demo.templates[0].exercises[0].exerciseId).toBe("bench");
  for (const workout of demo.workouts) {
    expect(validateWorkout(workout)).toBeNull();
    expect(isDemoItem(workout)).toBe(true);
    expect(Date.parse(workout.date)).toBeLessThanOrEqual(now.getTime());
    for (const exercise of workout.exercises) {
      expect(demo.exercises.some((item) => item.id === exercise.exerciseId)).toBe(true);
    }
  }
  expect(demo.workouts[8].date).toBe(now.toISOString());
  expect(demo.workouts[6].exercises[0].sets[0].weight).toBe("55");
  expect(isDemoItem({ id: "personal-workout" })).toBe(false);
});
