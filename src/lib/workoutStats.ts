import { isValidSet } from "@/lib/validation";
import type { Workout, WorkoutSet } from "@/types/workout";

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfWeek(date: Date): Date {
  const copy = startOfDay(date);
  const dayIndex = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - dayIndex);
  return copy;
}

export function computeSetVolume(weight: string, reps: string): number {
  const parsedWeight = Number(weight);
  const parsedReps = Number(reps);

  if (!isValidSet({ weight, reps })) {
    return 0;
  }

  return parsedWeight * parsedReps;
}

export function computeWorkoutVolume(workout: Workout): number {
  return workout.exercises.reduce(
    (total, exercise) =>
      total +
      exercise.sets.reduce(
        (setTotal, set) => setTotal + computeSetVolume(set.weight, set.reps),
        0,
      ),
    0,
  );
}

export function computeWorkoutsThisWeek(workouts: Workout[]): number {
  const now = new Date();
  const weekStart = startOfWeek(now);

  return workouts.filter(
    (workout) =>
      new Date(workout.date) >= weekStart && new Date(workout.date) <= now,
  ).length;
}

export function computeCurrentStreakDays(workouts: Workout[]): number {
  if (workouts.length === 0) {
    return 0;
  }

  const trainedDays = new Set(
    workouts.map((workout) => startOfDay(new Date(workout.date)).getTime()),
  );

  const cursor = startOfDay(new Date());

  if (!trainedDays.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;

  while (trainedDays.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export type VolumePoint = {
  workoutId: string;
  date: string;
  volume: number;
};

export function computeVolumeSeries(workouts: Workout[]): VolumePoint[] {
  return [...workouts]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((workout) => ({
      workoutId: workout.id,
      date: workout.date,
      volume: computeWorkoutVolume(workout),
    }));
}

export type ProgressionPoint = {
  date: string;
  estimatedOneRepMax: number;
};

export function computeExerciseProgression(
  workouts: Workout[],
  exerciseId: string,
): ProgressionPoint[] {
  const chronological = [...workouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const points: ProgressionPoint[] = [];

  for (const workout of chronological) {
    const exercise = workout.exercises.find(
      (item) => item.exerciseId === exerciseId,
    );

    if (!exercise) {
      continue;
    }

    let best = 0;

    for (const set of exercise.sets) {
      const weight = Number(set.weight);
      const reps = Number(set.reps);

      if (!isValidSet(set) || weight <= 0 || reps <= 0) {
        continue;
      }

      const oneRepMax = reps <= 1 ? weight : weight * (1 + reps / 30);

      best = Math.max(best, oneRepMax);
    }

    if (best > 0) {
      points.push({
        date: workout.date,
        estimatedOneRepMax: Math.round(best),
      });
    }
  }

  return points;
}

export function getLastExerciseSets(
  workouts: Workout[],
  exerciseId: string,
): WorkoutSet[] | null {
  const chronological = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  for (const workout of chronological) {
    const exercise = workout.exercises.find(
      (item) => item.exerciseId === exerciseId,
    );

    if (exercise) {
      return exercise.sets;
    }
  }

  return null;
}
