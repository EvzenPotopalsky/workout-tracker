import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type {
  Exercise,
  Workout,
  WorkoutTemplate,
  WorkoutExercise,
} from "@/types/workout";
import Button from "@/components/Button";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import TextField from "@/components/TextField";
import { computePersonalRecords } from "@/lib/personalRecords";

type ExerciseLibraryProps = {
  exerciseList: Exercise[];
  setExerciseList: Dispatch<SetStateAction<Exercise[]>>;
  selectedExercise: string;
  currentExercises: WorkoutExercise[];
  templates: WorkoutTemplate[];
  workouts: Workout[];
};

export default function ExerciseLibrary({
  exerciseList,
  setExerciseList,
  selectedExercise,
  templates,
  currentExercises,
  workouts,
}: ExerciseLibraryProps) {
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [newExercise, setNewExercise] = useState("");
  const [exerciseError, setExerciseError] = useState<string | null>(null);

  const records = useMemo(
    () => computePersonalRecords(workouts).records,
    [workouts],
  );

  function handleAddExercise() {
    if (!newExercise.trim()) {
      setExerciseError("Enter an exercise name.");
      return;
    }

    if (
      exerciseList.some(
        (exercise) =>
          exercise.name.toLowerCase() === newExercise.trim().toLowerCase(),
      )
    ) {
      setExerciseError("This exercise already exists.");
      return;
    }

    setExerciseList((currentExercises) => [
      ...currentExercises,
      {
        id: crypto.randomUUID(),
        name: newExercise.trim(),
      },
    ]);

    setNewExercise("");
    setExerciseError(null);
  }

  function handleDeleteExercise(exercise: Exercise) {
    const isUsedInTemplate = templates.some((template) =>
      template.exercises.some(
        (templateExercise) => templateExercise.exerciseId === exercise.id,
      ),
    );

    if (isUsedInTemplate) {
      setExerciseError("This exercise is used in a template.");
      return;
    }

    if (currentExercises.some((item) => item.exerciseId === exercise.id)) {
      setExerciseError("This exercise is used in your unfinished workout.");
      return;
    }

    if (exercise.id === selectedExercise) {
      setExerciseError("You cannot delete the currently selected exercise.");
      return;
    }

    setExerciseList((currentExercises) =>
      currentExercises.filter((item) => item.id !== exercise.id),
    );

    setExerciseError(null);
  }

  const filteredExercises = exerciseList.filter((exercise) =>
    exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase()),
  );

  return (
    <Card title="Exercises" description="The exercises available to log.">
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <TextField
            label="New exercise name"
            containerClassName="grow"
            type="text"
            placeholder="e.g. Incline Dumbbell Press"
            value={newExercise}
            onChange={(event) => {
              setNewExercise(event.target.value);
              setExerciseError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleAddExercise();
              }
            }}
          />

          <Button variant="primary" onClick={handleAddExercise}>
            Add exercise
          </Button>
        </div>

        {exerciseError && (
          <p role="alert" className="text-xs text-red-400">
            {exerciseError}
          </p>
        )}

        <TextField
          label="Search exercises"
          hideLabel
          type="text"
          placeholder="Search exercises…"
          value={exerciseSearch}
          onChange={(event) => setExerciseSearch(event.target.value)}
        />

        {filteredExercises.length === 0 ? (
          <EmptyState>
            {exerciseList.length === 0
              ? "No exercises yet — add your first one above."
              : "No exercises match your search."}
          </EmptyState>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {filteredExercises.map((exercise) => {
              const record = records[exercise.id];

              return (
                <li
                  key={exercise.id}
                  className="flex items-center justify-between gap-2 py-2"
                >
                  <div>
                    <span className="text-sm text-neutral-200">
                      {exercise.name}
                    </span>
                    {record && (
                      <span className="block text-xs text-neutral-400">
                        PR: {record.weight} kg × {record.reps}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => handleDeleteExercise(exercise)}
                  >
                    Delete
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
