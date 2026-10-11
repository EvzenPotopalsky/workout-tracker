import { useState } from "react";
import type { Exercise, WorkoutTemplate } from "@/types/workout";
import Button from "@/components/Button";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import SelectField from "@/components/SelectField";
import TextField from "@/components/TextField";

type WorkoutTemplatesProps = {
  templates: WorkoutTemplate[];
  exerciseList: Exercise[];
  onStartWorkout: (
    template: WorkoutTemplate,
    replaceCurrentWorkout?: boolean,
  ) => string | null;
  onUpdateTemplate: (template: WorkoutTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
};

export default function WorkoutTemplates({
  templates,
  exerciseList,
  onStartWorkout,
  onUpdateTemplate,
  onDeleteTemplate,
}: WorkoutTemplatesProps) {
  const [templateDraft, setTemplateDraft] = useState<WorkoutTemplate | null>(
    null,
  );
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [startTemplateId, setStartTemplateId] = useState<string | null>(null);
  const [templateExerciseError, setTemplateExerciseError] = useState<
    string | null
  >(null);
  const [templateSaveError, setTemplateSaveError] = useState<string | null>(
    null,
  );

  const [templateExerciseToAddState, setTemplateExerciseToAdd] = useState(
    () => exerciseList[0]?.id ?? "",
  );

  const templateExerciseToAdd = exerciseList.some(
    (exercise) => exercise.id === templateExerciseToAddState,
  )
    ? templateExerciseToAddState
    : (exerciseList[0]?.id ?? "");

  function startEditing(template: WorkoutTemplate) {
    setTemplateExerciseError(null);
    setTemplateSaveError(null);

    setTemplateDraft({
      ...template,
      exercises: template.exercises.map((exercise) => ({
        ...exercise,
      })),
    });
  }

  function cancelEditing() {
    setTemplateDraft(null);
    setTemplateExerciseError(null);
    setTemplateSaveError(null);
  }

  function addExerciseToTemplate() {
    if (!templateDraft) {
      return;
    }

    const exerciseExists = exerciseList.some(
      (exercise) => exercise.id === templateExerciseToAdd,
    );

    if (!exerciseExists) {
      setTemplateExerciseError("Please select a valid exercise.");
      return;
    }

    if (
      templateDraft.exercises.some(
        (exercise) => exercise.exerciseId === templateExerciseToAdd,
      )
    ) {
      setTemplateExerciseError("This exercise is already in the template.");
      return;
    }

    setTemplateExerciseError(null);

    setTemplateDraft((currentDraft) => {
      if (!currentDraft) {
        return currentDraft;
      }

      return {
        ...currentDraft,
        exercises: [
          ...currentDraft.exercises,
          {
            exerciseId: templateExerciseToAdd,
            sets: 1,
          },
        ],
      };
    });
  }

  function removeExerciseFromTemplate(exerciseId: string) {
    setTemplateDraft((currentDraft) => {
      if (!currentDraft) {
        return currentDraft;
      }

      return {
        ...currentDraft,
        exercises: currentDraft.exercises.filter(
          (exercise) => exercise.exerciseId !== exerciseId,
        ),
      };
    });

    setTemplateSaveError(null);
  }

  function updateTemplateExerciseSets(exerciseId: string, sets: number) {
    setTemplateDraft((currentDraft) => {
      if (!currentDraft) {
        return currentDraft;
      }

      return {
        ...currentDraft,
        exercises: currentDraft.exercises.map((exercise) =>
          exercise.exerciseId === exerciseId
            ? {
                ...exercise,
                sets,
              }
            : exercise,
        ),
      };
    });

    setTemplateSaveError(null);
  }

  function saveTemplate() {
    if (!templateDraft) {
      return;
    }

    if (!templateDraft.name.trim()) {
      setTemplateSaveError("Please enter a template name.");
      return;
    }

    if (templateDraft.exercises.length === 0) {
      setTemplateSaveError("Please add at least one exercise.");
      return;
    }

    if (
      templateDraft.exercises.some(
        (exercise) =>
          !Number.isInteger(exercise.sets) ||
          exercise.sets < 1 ||
          exercise.sets > 100,
      )
    ) {
      setTemplateSaveError("Each exercise must have 1 to 100 whole sets.");
      return;
    }

    if (
      templateDraft.exercises.some(
        (exercise) =>
          !exerciseList.some((item) => item.id === exercise.exerciseId),
      )
    ) {
      setTemplateSaveError(
        "Remove or replace exercises that no longer exist before saving.",
      );
      return;
    }

    setTemplateSaveError(null);
    onUpdateTemplate({
      ...templateDraft,
      name: templateDraft.name.trim(),
    });
    cancelEditing();
  }

  return (
    <Card title="Templates" description="Reusable workout plans.">
      {startError && (
        <p role="alert" className="mb-3 text-sm text-red-400">
          {startError}
        </p>
      )}
      {templates.length === 0 ? (
        <EmptyState>
          No templates yet — save a workout as a template to reuse it later.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded-xl border border-neutral-800 p-4"
            >
              {templateDraft?.id === template.id ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <TextField
                      label="Template name"
                      value={templateDraft.name}
                      onChange={(event) => {
                        setTemplateSaveError(null);

                        setTemplateDraft((currentDraft) => {
                          if (!currentDraft) {
                            return currentDraft;
                          }

                          return {
                            ...currentDraft,
                            name: event.target.value,
                          };
                        });
                      }}
                    />

                    {templateSaveError && (
                      <p role="alert" className="text-xs text-red-400">
                        {templateSaveError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                      <SelectField
                        label="Exercise"
                        containerClassName="grow"
                        value={templateExerciseToAdd}
                        onChange={(event) => {
                          setTemplateExerciseToAdd(event.target.value);
                          setTemplateExerciseError(null);
                        }}
                      >
                        {exerciseList.map((exercise) => (
                          <option key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </option>
                        ))}
                      </SelectField>

                      <Button onClick={addExerciseToTemplate}>
                        Add exercise
                      </Button>
                    </div>

                    {templateExerciseError && (
                      <p role="alert" className="text-xs text-red-400">
                        {templateExerciseError}
                      </p>
                    )}
                  </div>

                  {templateDraft.exercises.length > 0 && (
                    <ul className="space-y-2">
                      {templateDraft.exercises.map((templateExercise) => {
                        const exercise = exerciseList.find(
                          (item) => item.id === templateExercise.exerciseId,
                        );

                        return (
                          <li
                            key={templateExercise.exerciseId}
                            className="flex flex-wrap items-center gap-2"
                          >
                            <span className="grow text-sm text-neutral-200">
                              {exercise?.name ?? "Unknown exercise"}
                            </span>

                            <TextField
                              label={`Sets for ${exercise?.name ?? "exercise"}`}
                              hideLabel
                              containerClassName="w-20"
                              type="number"
                              min="1"
                              max="100"
                              step="1"
                              value={templateExercise.sets}
                              onChange={(event) =>
                                updateTemplateExerciseSets(
                                  templateExercise.exerciseId,
                                  Number(event.target.value),
                                )
                              }
                            />

                            <Button
                              variant="ghost"
                              onClick={() =>
                                removeExerciseFromTemplate(
                                  templateExercise.exerciseId,
                                )
                              }
                            >
                              Remove
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <div className="flex flex-wrap gap-2 border-t border-neutral-800 pt-3">
                    <Button variant="primary" onClick={saveTemplate}>
                      Save changes
                    </Button>

                    <Button onClick={cancelEditing}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-neutral-50">
                      {template.name}
                    </h3>

                    <ul className="mt-1 space-y-0.5 text-sm text-neutral-400">
                      {template.exercises.map((templateExercise) => {
                        const exercise = exerciseList.find(
                          (item) => item.id === templateExercise.exerciseId,
                        );

                        return (
                          <li key={templateExercise.exerciseId}>
                            {exercise?.name ?? "Unknown exercise"} —{" "}
                            {templateExercise.sets} sets
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {startTemplateId === template.id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-neutral-400">
                          Discard unfinished workout?
                        </span>

                        <Button
                          variant="danger"
                          onClick={() => {
                            const error = onStartWorkout(template, true);
                            setStartError(error);
                            setStartTemplateId(null);
                          }}
                        >
                          Confirm
                        </Button>

                        <Button onClick={() => setStartTemplateId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => {
                          const error = onStartWorkout(template);

                          setStartError(null);
                          if (error === "You have an unfinished workout.") {
                            setStartTemplateId(template.id);
                          } else {
                            setStartError(error);
                          }
                        }}
                      >
                        Start workout
                      </Button>
                    )}

                    <Button onClick={() => startEditing(template)}>
                      Edit template
                    </Button>

                    {deleteTemplateId === template.id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-neutral-400">
                          Delete template?
                        </span>

                        <Button
                          variant="danger"
                          onClick={() => {
                            document.getElementById("panel-log")?.focus();
                            onDeleteTemplate(template.id);
                            setDeleteTemplateId(null);
                          }}
                        >
                          Confirm
                        </Button>

                        <Button onClick={() => setDeleteTemplateId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="danger"
                        onClick={() => setDeleteTemplateId(template.id)}
                      >
                        Delete template
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
