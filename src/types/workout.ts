export type WorkoutSet = {
  weight: string;
  reps: string;
};

export type WorkoutExercise = {
  exerciseId: string;
  name: string;
  sets: WorkoutSet[];
};

export type Workout = {
  id: string;
  name: string;
  date: string;
  exercises: WorkoutExercise[];
};

export type CurrentWorkout = {
  name: string;
  exercises: WorkoutExercise[];
};

export type WorkoutTemplateExercise = {
  exerciseId: string;
  sets: number;
};

export type WorkoutTemplate = {
  id: string;
  name: string;
  exercises: WorkoutTemplateExercise[];
};

export type Exercise = {
  id: string;
  name: string;
};

export type PersonalRecord = {
  exerciseId: string;
  weight: number;
  reps: number;
  estimatedOneRepMax: number;
  workoutId: string;
  date: string;
};
