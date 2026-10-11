import { afterEach, describe, expect, it, vi } from "vitest";
import type { Workout } from "@/types/workout";
import {
  computeWorkoutsThisWeek,
  computeCurrentStreakDays,
  computeExerciseProgression,
  computeSetVolume,
  computeWorkoutVolume,
  getLastExerciseSets,
} from "@/lib/workoutStats";

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

function createExercise(
  exerciseId: string,
  sets: { weight: string; reps: string }[],
) {
  return {
    exerciseId,
    name: exerciseId,
    sets,
  };
}

describe("computeSetVolume", () => {
  it("calculates weight multiplied by reps", () => {
    expect(computeSetVolume("100", "8")).toBe(800);
  });

  it("returns 0 for invalid values", () => {
    expect(computeSetVolume("", "8")).toBe(0);
    expect(computeSetVolume("100", "")).toBe(0);
  });
});

describe("computeWorkoutVolume", () => {
  it("calculates the total volume of all sets", () => {
    const workout = createWorkout("1", "2026-09-20T10:00:00.000Z", [
      createExercise("bench", [
        { weight: "100", reps: "5" },
        { weight: "90", reps: "8" },
      ]),
      createExercise("squat", [{ weight: "120", reps: "5" }]),
    ]);

    expect(computeWorkoutVolume(workout)).toBe(1820);
  });
});

describe("getLastExerciseSets", () => {
  it("returns the sets from the most recent workout containing the exercise", () => {
    const workouts: Workout[] = [
      createWorkout("1", "2026-09-20T10:00:00.000Z", [
        createExercise("bench", [{ weight: "90", reps: "8" }]),
      ]),
      createWorkout("2", "2026-09-25T10:00:00.000Z", [
        createExercise("bench", [
          { weight: "100", reps: "6" },
          { weight: "95", reps: "8" },
        ]),
      ]),
    ];

    expect(getLastExerciseSets(workouts, "bench")).toEqual([
      { weight: "100", reps: "6" },
      { weight: "95", reps: "8" },
    ]);
  });

  it("returns null when the exercise has never been logged", () => {
    const workouts: Workout[] = [
      createWorkout("1", "2026-09-20T10:00:00.000Z", [
        createExercise("bench", [{ weight: "90", reps: "8" }]),
      ]),
    ];

    expect(getLastExerciseSets(workouts, "squat")).toBeNull();
  });
});

describe("computeExerciseProgression", () => {
  it("returns the best estimated one-rep max for each workout", () => {
    const workouts: Workout[] = [
      createWorkout("1", "2026-09-20T10:00:00.000Z", [
        createExercise("bench", [
          { weight: "100", reps: "5" },
          { weight: "90", reps: "8" },
        ]),
      ]),
      createWorkout("2", "2026-09-25T10:00:00.000Z", [
        createExercise("bench", [{ weight: "110", reps: "5" }]),
      ]),
    ];

    expect(computeExerciseProgression(workouts, "bench")).toEqual([
      {
        date: "2026-09-20T10:00:00.000Z",
        estimatedOneRepMax: 117,
      },
      {
        date: "2026-09-25T10:00:00.000Z",
        estimatedOneRepMax: 128,
      },
    ]);
  });
});

describe("computeCurrentStreakDays", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts consecutive training days ending today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 26, 12, 0, 0));

    const workouts: Workout[] = [
      createWorkout("1", "2026-09-24T10:00:00", []),
      createWorkout("2", "2026-09-25T10:00:00", []),
      createWorkout("3", "2026-09-26T10:00:00", []),
    ];

    expect(computeCurrentStreakDays(workouts)).toBe(3);
  });

  it("keeps yesterday's streak alive when there was no workout today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 26, 12, 0, 0));

    const workouts: Workout[] = [
      createWorkout("1", "2026-09-24T10:00:00", []),
      createWorkout("2", "2026-09-25T10:00:00", []),
    ];

    expect(computeCurrentStreakDays(workouts)).toBe(2);
  });

  it("returns 0 when the last workout was more than one day ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 26, 12, 0, 0));

    const workouts: Workout[] = [createWorkout("1", "2026-09-24T10:00:00", [])];

    expect(computeCurrentStreakDays(workouts)).toBe(0);
  });
});

describe("invalid stats inputs", () => {
  it("ignores negative weights and fractional reps", () => {
    expect(computeSetVolume("-10", "5")).toBe(0);
    expect(computeSetVolume("100", "2.5")).toBe(0);
    expect(
      computeExerciseProgression(
        [
          createWorkout("a", "2026-09-20", [
            createExercise("bench", [{ weight: "100", reps: "2.5" }]),
          ]),
        ],
        "bench",
      ),
    ).toEqual([]);
  });
});

it("excludes future-dated workouts from this week", () => {
  vi.useFakeTimers();
  try {
    vi.setSystemTime(new Date(2026, 8, 26, 12));
    expect(
      computeWorkoutsThisWeek([
        createWorkout("a", "2026-09-25T10:00:00", []),
        createWorkout("b", "2026-09-27T10:00:00", []),
      ]),
    ).toBe(1);
  } finally {
    vi.useRealTimers();
  }
});
