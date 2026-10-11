import { useState } from "react";
import type {
  Exercise,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from "@/types/workout";
import Button from "@/components/Button";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import SelectField from "@/components/SelectField";
import TextField from "@/components/TextField";
import { getLastExerciseSets } from "@/lib/workoutStats";

type WorkoutEditorProps = {
  workoutName: string;
  setWorkoutName: (name: string) => void;
  exercises: WorkoutExercise[];
  selectedExercise: string;
  setSelectedExercise: (exerciseId: string) => void;
  exerciseList: Exercise[];
  workouts: Workout[];
  addExercise: () => string | null;
  updateSet: (
    exerciseIndex: number,
    setIndex: number,
    field: keyof WorkoutSet,
    value: string,
  ) => void;
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  removeExercise: (exerciseIndex: number) => void;
  onSaveTemplate: (templateName: string) => string | null;
  onFinishWorkout: () => string | null;
  onClearWorkout: () => void;
};

export default function WorkoutEditor({
  workoutName,
  setWorkoutName,
  exercises,
  selectedExercise,
  setSelectedExercise,
  exerciseList,
  workouts,
  addExercise,
  updateSet,
  addSet,
  removeSet,
  removeExercise,
  onSaveTemplate,
  onFinishWorkout,
  onClearWorkout,
}: WorkoutEditorProps) {
  const hasExercises = exercises.length > 0;

  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateNameError, setTemplateNameError] = useState<string | null>(
    null,
  );
  const [exerciseError, setExerciseError] = useState<string | null>(null);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  function handleSaveTemplate() {
    if (!templateName.trim()) {
      setTemplateNameError("Enter a template name.");
      return;
    }

    const error = onSaveTemplate(templateName.trim());

    if (error) {
      setTemplateNameError(error);
      return;
    }

    setTemplateName("");
    setTemplateNameError(null);
    setShowTemplateForm(false);
  }

  function handleCancelTemplate() {
    setTemplateName("");
    setTemplateNameError(null);
    setShowTemplateForm(false);
  }

  function handleAddExercise() {
    const error = addExercise();
    setExerciseError(error);

    if (!error) {
      setFinishError(null);
    }
  }

  function formatLastSets(sets: WorkoutSet[]): string {
    return sets
      .filter((set) => set.weight.trim() !== "" && set.reps.trim() !== "")
      .map((set) => `${set.weight} kg × ${set.reps}`)
      .join(", ");
  }

  return (
    <Card title="Log workout" description="Build today's session set by set.">
      <div className="space-y-4">
        <TextField
          label="Workout name"
          aria-describedby={finishError ? "finish-error" : undefined}
          type="text"
          placeholder="e.g. Push Day"
          value={workoutName}
          onChange={(event) => {
            setWorkoutName(event.target.value);
            setFinishError(null);
          }}
        />

        <div className="space-y-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <SelectField
              label="Exercise"
              containerClassName="grow"
              value={selectedExercise}
              onChange={(event) => {
                setSelectedExercise(event.target.value);
                setExerciseError(null);
              }}
            >
              {exerciseList.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </SelectField>

            <Button variant="primary" onClick={handleAddExercise}>
              Add exercise
            </Button>
          </div>

          {exerciseError && (
            <p role="alert" className="text-xs text-red-400">
              {exerciseError}
            </p>
          )}
        </div>

        {hasExercises ? (
          <div className="space-y-3">
            {exercises.map((exercise, exerciseIndex) => {
              const lastExerciseSets = getLastExerciseSets(
                workouts,
                exercise.exerciseId,
              );

              const lastSetsText = lastExerciseSets
                ? formatLastSets(lastExerciseSets)
                : "";

              return (
                <div
                  key={exercise.exerciseId}
                  className="space-y-3 rounded-xl border border-neutral-800 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-neutral-50">
                        {exercise.name}
                      </h3>

                      {lastSetsText && (
                        <p className="mt-0.5 text-xs text-neutral-400">
                          Last time: {lastSetsText}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      onClick={() => {
                        removeExercise(exerciseIndex);
                        setFinishError(null);
                      }}
                    >
                      Remove exercise
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {exercise.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <span className="w-12 shrink-0 text-sm text-neutral-400">
                          Set {setIndex + 1}
                        </span>

                        <TextField
                          label={`${exercise.name}, set ${setIndex + 1} weight in kilograms`}
                          hideLabel
                          containerClassName="w-24"
                          type="number"
                          min="0"
                          step="any"
                          placeholder="kg"
                          value={set.weight}
                          onChange={(event) => {
                            updateSet(
                              exerciseIndex,
                              setIndex,
                              "weight",
                              event.target.value,
                            );
                            setFinishError(null);
                          }}
                        />

                        <TextField
                          label={`${exercise.name}, set ${setIndex + 1} reps`}
                          hideLabel
                          containerClassName="w-24"
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Reps"
                          value={set.reps}
                          onChange={(event) => {
                            updateSet(
                              exerciseIndex,
                              setIndex,
                              "reps",
                              event.target.value,
                            );
                            setFinishError(null);
                          }}
                        />

                        <Button
                          variant="ghost"
                          onClick={() => {
                            removeSet(exerciseIndex, setIndex);
                            setFinishError(null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => {
                      addSet(exerciseIndex);
                      setFinishError(null);
                    }}
                  >
                    Add set
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState>
            No exercises yet — pick one above and add it to this workout.
          </EmptyState>
        )}

        <div className="space-y-3 border-t border-neutral-800 pt-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              onClick={() => {
                const error = onFinishWorkout();
                setFinishError(error);
              }}
            >
              Finish workout
            </Button>

            <Button
              onClick={() => {
                setShowTemplateForm(true);
                setTemplateNameError(null);
              }}
            >
              Save as template
            </Button>

            <Button
              variant="danger"
              onClick={() => setShowClearConfirmation(true)}
            >
              Clear workout
            </Button>
          </div>

          {finishError && (
            <p id="finish-error" role="alert" className="text-xs text-red-400">
              {finishError}
            </p>
          )}

          {showClearConfirmation && (
            <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-neutral-200">
                    Clear unfinished workout?
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    This will remove the workout you are currently building.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="danger"
                    onClick={() => {
                      onClearWorkout();
                      setShowClearConfirmation(false);
                      setFinishError(null);
                    }}
                  >
                    Clear workout
                  </Button>

                  <Button onClick={() => setShowClearConfirmation(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showTemplateForm && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
              <div className="space-y-3">
                <TextField
                  label="Template name"
                  type="text"
                  placeholder="e.g. Push Day"
                  value={templateName}
                  onChange={(event) => {
                    setTemplateName(event.target.value);
                    setTemplateNameError(null);
                  }}
                />

                {templateNameError && (
                  <p role="alert" className="text-xs text-red-400">
                    {templateNameError}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" onClick={handleSaveTemplate}>
                    Save template
                  </Button>

                  <Button onClick={handleCancelTemplate}>Cancel</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
