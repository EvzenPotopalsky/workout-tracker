import type {
  CurrentWorkout,
  Exercise,
  Workout,
  WorkoutSet,
  WorkoutTemplate,
} from "@/types/workout";

export function isValidSet(set: WorkoutSet): boolean {
  const weight = Number(set.weight);
  const reps = Number(set.reps);
  return (
    set.weight.trim() !== "" &&
    set.reps.trim() !== "" &&
    Number.isFinite(weight) &&
    weight >= 0 &&
    Number.isInteger(reps) &&
    reps > 0
  );
}

export function validateWorkout(workout: CurrentWorkout): string | null {
  if (!workout.name.trim()) return "Please enter a workout name.";
  if (workout.exercises.length === 0)
    return "Please add at least one exercise.";
  if (workout.exercises.some((exercise) => exercise.sets.length === 0)) {
    return "Each exercise must have at least one set.";
  }
  if (
    workout.exercises.some((exercise) =>
      exercise.sets.some((set) => !isValidSet(set)),
    )
  ) {
    return "Enter a weight of 0 or greater and a positive whole number of reps for every set.";
  }
  return null;
}

// JSON parsing does not guarantee the shape of browser-stored data.
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isString(value: unknown): value is string {
  return typeof value === "string";
}
function isExercise(value: unknown): value is Exercise {
  return isObject(value) && isString(value.id) && isString(value.name);
}
function isWorkoutExercise(value: unknown): boolean {
  return (
    isObject(value) &&
    isString(value.exerciseId) &&
    isString(value.name) &&
    Array.isArray(value.sets) &&
    value.sets.every(
      (set) => isObject(set) && isString(set.weight) && isString(set.reps),
    )
  );
}
export function isExerciseList(value: unknown): value is Exercise[] {
  return Array.isArray(value) && value.every(isExercise);
}
export function isCurrentWorkout(value: unknown): value is CurrentWorkout {
  return (
    isObject(value) &&
    isString(value.name) &&
    Array.isArray(value.exercises) &&
    value.exercises.every(isWorkoutExercise)
  );
}
export function isWorkoutList(value: unknown): value is Workout[] {
  return (
    Array.isArray(value) &&
    value.every(
      (workout) =>
        isObject(workout) &&
        isString(workout.id) &&
        isString(workout.date) &&
        Number.isFinite(Date.parse(workout.date)) &&
        isCurrentWorkout(workout),
    )
  );
}
export function isTemplateList(value: unknown): value is WorkoutTemplate[] {
  return (
    Array.isArray(value) &&
    value.every(
      (template) =>
        isObject(template) &&
        isString(template.id) &&
        isString(template.name) &&
        Array.isArray(template.exercises) &&
        template.exercises.every(
          (exercise) =>
            isObject(exercise) &&
            isString(exercise.exerciseId) &&
            typeof exercise.sets === "number" &&
            Number.isInteger(exercise.sets) &&
            exercise.sets >= 1 &&
            exercise.sets <= 100,
        ),
    )
  );
}
