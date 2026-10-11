import type { Exercise, Workout, WorkoutTemplate } from "@/types/workout";

const DEMO_PREFIX = "workout-tracker-demo-";

export function isDemoItem(item: { id: string }): boolean {
  return item.id.startsWith(DEMO_PREFIX);
}

// Reuse matching library exercises so templates and progression share their IDs.
export function createDemoData(existingExercises: Exercise[], now = new Date()) {
  const exercises = [...existingExercises];
  function exerciseId(name: string) {
    const existing = exercises.find(
      (exercise) => exercise.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) return existing.id;
    const id = crypto.randomUUID();
    exercises.push({ id, name });
    return id;
  }

  const plans = [
    { name: "Push", exercises: [
      { name: "Bench Press", weight: 50, reps: 8 },
      { name: "Overhead Press", weight: 25, reps: 8 },
      { name: "Triceps Pushdown", weight: 20, reps: 12 },
    ] },
    { name: "Pull", exercises: [
      { name: "Deadlift", weight: 80, reps: 5 },
      { name: "Barbell Row", weight: 40, reps: 10 },
      { name: "Lat Pulldown", weight: 40, reps: 10 },
    ] },
    { name: "Legs", exercises: [
      { name: "Squat", weight: 60, reps: 8 },
      { name: "Romanian Deadlift", weight: 50, reps: 10 },
      { name: "Calf Raise", weight: 30, reps: 12 },
    ] },
  ].map((plan) => ({
    ...plan,
    exercises: plan.exercises.map((exercise) => ({
      ...exercise,
      exerciseId: exerciseId(exercise.name),
    })),
  }));

  const templates: WorkoutTemplate[] = plans.map((plan, index) => ({
    id: `${DEMO_PREFIX}template-${index}`,
    name: `Demo · ${plan.name}`,
    exercises: plan.exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      sets: 3,
    })),
  }));

  const workouts: Workout[] = Array.from({ length: 9 }, (_, index) => {
    const plan = plans[index % plans.length];
    const week = Math.floor(index / plans.length);
    const date = new Date(now);
    date.setDate(date.getDate() - (2 - week) * 7 - (2 - index % 3) * 2);
    return {
      id: `${DEMO_PREFIX}workout-${index}`,
      name: `Demo · ${plan.name}`,
      date: date.toISOString(),
      exercises: plan.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        sets: Array.from({ length: 3 }, (_, setIndex) => ({
          weight: String(exercise.weight + week * 2.5),
          reps: String(exercise.reps - setIndex),
        })),
      })),
    };
  });

  return { exercises, workouts, templates };
}
