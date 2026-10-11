import { describe, expect, it } from "vitest";
import type { Workout } from "@/types/workout";
import {
  computePersonalRecords,
  findNewPersonalRecords,
  setKey,
} from "@/lib/personalRecords";

function createWorkout(
  id: string,
  date: string,
  exercises: Workout["exercises"],
): Workout {
  return {
    id,
    name: `Workout ${id}`,
    date,
    exercises,
  };
}

describe("setKey", () => {
  it("creates a unique key for a set", () => {
    expect(setKey("workout-1", 2, 3)).toBe("workout-1:2:3");
  });
});

describe("computePersonalRecords", () => {
  it("stores the best estimated one-rep max per exercise", () => {
    const workouts: Workout[] = [
      createWorkout("1", "2026-09-20T10:00:00.000Z", [
        {
          exerciseId: "bench",
          name: "Bench Press",
          sets: [{ weight: "100", reps: "5" }],
        },
      ]),
      createWorkout("2", "2026-09-25T10:00:00.000Z", [
        {
          exerciseId: "bench",
          name: "Bench Press",
          sets: [{ weight: "110", reps: "5" }],
        },
      ]),
    ];

    const { records, prSetKeys } = computePersonalRecords(workouts);

    expect(records.bench).toEqual({
      exerciseId: "bench",
      weight: 110,
      reps: 5,
      estimatedOneRepMax: 128.33333333333334,
      workoutId: "2",
      date: "2026-09-25T10:00:00.000Z",
    });

    expect(prSetKeys.has(setKey("1", 0, 0))).toBe(true);
    expect(prSetKeys.has(setKey("2", 0, 0))).toBe(true);
  });

  it("ignores invalid sets", () => {
    const workouts: Workout[] = [
      createWorkout("1", "2026-09-20T10:00:00.000Z", [
        {
          exerciseId: "bench",
          name: "Bench Press",
          sets: [
            { weight: "", reps: "5" },
            { weight: "100", reps: "" },
            { weight: "-10", reps: "5" },
            { weight: "0", reps: "5" },
          ],
        },
      ]),
    ];

    const { records } = computePersonalRecords(workouts);

    expect(records).toEqual({});
  });
});

describe("findNewPersonalRecords", () => {
  it("finds a PR created by the new workout", () => {
    const previousWorkouts: Workout[] = [
      createWorkout("1", "2026-09-20T10:00:00.000Z", [
        {
          exerciseId: "bench",
          name: "Bench Press",
          sets: [{ weight: "100", reps: "5" }],
        },
      ]),
    ];

    const newWorkout = createWorkout("2", "2026-09-25T10:00:00.000Z", [
      {
        exerciseId: "bench",
        name: "Bench Press",
        sets: [{ weight: "110", reps: "5" }],
      },
    ]);

    const newPRs = findNewPersonalRecords(previousWorkouts, newWorkout);

    expect(newPRs).toHaveLength(1);
    expect(newPRs[0].exerciseId).toBe("bench");
    expect(newPRs[0].weight).toBe(110);
    expect(newPRs[0].reps).toBe(5);
  });

  it("returns no PR when the new workout does not beat the existing record", () => {
    const previousWorkouts: Workout[] = [
      createWorkout("1", "2026-09-20T10:00:00.000Z", [
        {
          exerciseId: "bench",
          name: "Bench Press",
          sets: [{ weight: "110", reps: "5" }],
        },
      ]),
    ];

    const newWorkout = createWorkout("2", "2026-09-25T10:00:00.000Z", [
      {
        exerciseId: "bench",
        name: "Bench Press",
        sets: [{ weight: "100", reps: "5" }],
      },
    ]);

    expect(findNewPersonalRecords(previousWorkouts, newWorkout)).toEqual([]);
  });
});
