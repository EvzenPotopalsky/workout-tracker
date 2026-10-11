import type { PersonalRecord, Workout } from "@/types/workout";

function estimateOneRepMax(weight: number, reps: number): number {
  if (reps <= 1) {
    return weight;
  }

  return weight * (1 + reps / 30);
}

function parseWeight(value: string): number | null {
  const parsed = Number(value);
  return value.trim() !== "" && Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : null;
}

function parseReps(value: string): number | null {
  const parsed = Number(value);
  return value.trim() !== "" && Number.isInteger(parsed) && parsed > 0
    ? parsed
    : null;
}

export function setKey(
  workoutId: string,
  exerciseIndex: number,
  setIndex: number,
) {
  return `${workoutId}:${exerciseIndex}:${setIndex}`;
}

export function computePersonalRecords(workouts: Workout[]): {
  records: Record<string, PersonalRecord>;
  prSetKeys: Set<string>;
} {
  const records: Record<string, PersonalRecord> = {};
  const prSetKeys = new Set<string>();

  const chronological = [...workouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  for (const workout of chronological) {
    workout.exercises.forEach((exercise, exerciseIndex) => {
      exercise.sets.forEach((set, setIndex) => {
        const weight = parseWeight(set.weight);
        const reps = parseReps(set.reps);

        if (weight === null || reps === null) {
          return;
        }

        const estimatedOneRepMax = estimateOneRepMax(weight, reps);

        if (estimatedOneRepMax <= 0) {
          return;
        }

        const currentRecord = records[exercise.exerciseId];

        if (
          !currentRecord ||
          estimatedOneRepMax > currentRecord.estimatedOneRepMax
        ) {
          records[exercise.exerciseId] = {
            exerciseId: exercise.exerciseId,
            weight,
            reps,
            estimatedOneRepMax,
            workoutId: workout.id,
            date: workout.date,
          };
          prSetKeys.add(setKey(workout.id, exerciseIndex, setIndex));
        }
      });
    });
  }

  return { records, prSetKeys };
}

export function findNewPersonalRecords(
  previousWorkouts: Workout[],
  newWorkout: Workout,
): PersonalRecord[] {
  const before = computePersonalRecords(previousWorkouts).records;
  const after = computePersonalRecords([
    ...previousWorkouts,
    newWorkout,
  ]).records;

  return Object.values(after).filter((record) => {
    if (record.workoutId !== newWorkout.id) {
      return false;
    }

    const previousRecord = before[record.exerciseId];
    return (
      !previousRecord ||
      record.estimatedOneRepMax > previousRecord.estimatedOneRepMax
    );
  });
}
