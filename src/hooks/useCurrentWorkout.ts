import { isCurrentWorkout } from "@/lib/validation";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type {
  CurrentWorkout,
  WorkoutExercise,
  WorkoutSet,
} from "@/types/workout";

export function useCurrentWorkout() {
  const [currentWorkout, setCurrentWorkout, storageError] =
    useLocalStorage<CurrentWorkout>(
      "currentWorkout",
      {
        name: "",
        exercises: [],
      },
      isCurrentWorkout,
    );

  function setWorkoutName(name: string) {
    setCurrentWorkout((current) => ({
      ...current,
      name,
    }));
  }

  function setExercises(exercises: WorkoutExercise[]) {
    setCurrentWorkout((current) => ({
      ...current,
      exercises,
    }));
  }

  function updateSet(
    exerciseIndex: number,
    setIndex: number,
    field: keyof WorkoutSet,
    value: string,
  ) {
    setCurrentWorkout((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, currentExerciseIndex) =>
        currentExerciseIndex === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, currentSetIndex) =>
                currentSetIndex === setIndex
                  ? {
                      ...set,
                      [field]: value,
                    }
                  : set,
              ),
            }
          : exercise,
      ),
    }));
  }

  function addSet(exerciseIndex: number) {
    setCurrentWorkout((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, currentExerciseIndex) =>
        currentExerciseIndex === exerciseIndex
          ? {
              ...exercise,
              sets: [
                ...exercise.sets,
                {
                  weight: "",
                  reps: "",
                },
              ],
            }
          : exercise,
      ),
    }));
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    setCurrentWorkout((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, currentExerciseIndex) =>
        currentExerciseIndex === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.filter(
                (_, currentSetIndex) => currentSetIndex !== setIndex,
              ),
            }
          : exercise,
      ),
    }));
  }

  function removeExercise(exerciseIndex: number) {
    setCurrentWorkout((current) => ({
      ...current,
      exercises: current.exercises.filter(
        (_, currentExerciseIndex) => currentExerciseIndex !== exerciseIndex,
      ),
    }));
  }

  function clearWorkout() {
    setCurrentWorkout({
      name: "",
      exercises: [],
    });
  }

  return {
    currentWorkout,
    storageError,
    workoutName: currentWorkout.name,
    exercises: currentWorkout.exercises,
    setWorkoutName,
    setExercises,
    updateSet,
    addSet,
    removeSet,
    removeExercise,
    clearWorkout,
  };
}
