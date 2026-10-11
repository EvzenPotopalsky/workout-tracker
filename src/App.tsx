import { useEffect, useRef, useState } from "react";
import WorkoutEditor from "@/components/WorkoutEditor";
import WorkoutHistory from "@/components/WorkoutHistory";
import ExerciseLibrary from "@/components/ExerciseLibrary";
import WorkoutTemplates from "@/components/WorkoutTemplates";
import Dashboard from "@/components/Dashboard";
import Tabs, { type Tab } from "@/components/Tabs";
import Button from "@/components/Button";
import { useCurrentWorkout } from "@/hooks/useCurrentWorkout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { createDemoData, isDemoItem } from "@/lib/demoData";
import { findNewPersonalRecords } from "@/lib/personalRecords";

import {
  isExerciseList,
  isWorkoutList,
  isTemplateList,
  validateWorkout,
} from "@/lib/validation";

import type { Exercise, Workout, WorkoutTemplate } from "@/types/workout";

const TABS: Tab[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "log", label: "Log" },
  { id: "history", label: "History" },
  { id: "exercises", label: "Exercises" },
];

type PRAlert = {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
};

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const focusNextPanel = useRef(false);

  useEffect(() => {
    if (focusNextPanel.current) {
      document.getElementById(`panel-${activeTab}`)?.focus();
      focusNextPanel.current = false;
    }
  }, [activeTab]);

  const [exerciseList, setExerciseList, exerciseStorageError] = useLocalStorage<
    Exercise[]
  >(
    "exercises",
    [
      {
        id: crypto.randomUUID(),
        name: "Bench Press",
      },
      {
        id: crypto.randomUUID(),
        name: "Squat",
      },
      {
        id: crypto.randomUUID(),
        name: "Deadlift",
      },
    ],
    isExerciseList,
  );

  const [selectedExerciseState, setSelectedExercise] = useState(
    () => exerciseList[0]?.id ?? "",
  );

  const selectedExercise = exerciseList.some(
    (exercise) => exercise.id === selectedExerciseState,
  )
    ? selectedExerciseState
    : (exerciseList[0]?.id ?? "");

  const {
    currentWorkout,
    storageError: currentWorkoutStorageError,
    workoutName,
    exercises,
    setWorkoutName,
    setExercises,
    updateSet,
    addSet,
    removeSet,
    removeExercise,
    clearWorkout,
  } = useCurrentWorkout();

  const [workouts, setWorkouts, workoutStorageError] = useLocalStorage<
    Workout[]
  >("workouts", [], isWorkoutList);

  const [templates, setTemplates, templateStorageError] = useLocalStorage<
    WorkoutTemplate[]
  >("templates", [], isTemplateList);

  const [prAlerts, setPrAlerts] = useState<PRAlert[]>([]);

  const [confirmClearDemo, setConfirmClearDemo] = useState(false);
  const [demoMessage, setDemoMessage] = useState("");
  const hasDemoData = workouts.some(isDemoItem) || templates.some(isDemoItem);
  const canLoadDemo = workouts.length === 0 && templates.length === 0 &&
    !currentWorkout.name.trim() && currentWorkout.exercises.length === 0 &&
    !exerciseStorageError && !workoutStorageError && !templateStorageError &&
    !currentWorkoutStorageError;

  function loadDemoData() {
    if (!canLoadDemo) return;
    const demo = createDemoData(exerciseList);
    setExerciseList(demo.exercises);
    setWorkouts(demo.workouts);
    setTemplates(demo.templates);
    setDemoMessage("Loaded 9 sample workouts and 3 templates. Explore History and Log to try them.");
  }

  function clearDemoData() {
    setWorkouts((items) => items.filter((item) => !isDemoItem(item)));
    setTemplates((items) => items.filter((item) => !isDemoItem(item)));
    setPrAlerts([]);
    setConfirmClearDemo(false);
    setDemoMessage("Demo workouts and templates removed. Your own data and exercise library were kept.");
  }

  function addExercise(): string | null {
    if (
      exercises.some((exercise) => exercise.exerciseId === selectedExercise)
    ) {
      return "This exercise is already in your workout.";
    }

    const exercise = exerciseList.find((item) => item.id === selectedExercise);

    if (!exercise) {
      return "Please select an exercise.";
    }

    setExercises([
      ...exercises,
      {
        exerciseId: exercise.id,
        name: exercise.name,
        sets: [
          {
            weight: "",
            reps: "",
          },
        ],
      },
    ]);

    return null;
  }

  function handleSaveTemplate(templateName: string): string | null {
    if (!templateName.trim()) return "Please enter a template name.";
    if (
      exercises.some(
        (exercise) => exercise.sets.length === 0 || exercise.sets.length > 100,
      )
    )
      return "Each template exercise must have 1 to 100 sets.";
    if (exercises.length === 0) {
      return "Please add at least one exercise.";
    }

    const hasMissingExercise = exercises.some(
      (exercise) =>
        !exerciseList.some((item) => item.id === exercise.exerciseId),
    );

    if (hasMissingExercise) {
      return "Your workout contains an exercise that no longer exists.";
    }

    setTemplates((currentTemplates) => [
      ...currentTemplates,
      {
        id: crypto.randomUUID(),
        name: templateName.trim(),
        exercises: exercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          sets: exercise.sets.length,
        })),
      },
    ]);

    return null;
  }

  function deleteWorkout(workoutId: string) {
    setWorkouts((currentWorkouts) =>
      currentWorkouts.filter((workout) => workout.id !== workoutId),
    );
  }

  function handleClearWorkout() {
    clearWorkout();
  }

  function handleStartWorkout(
    template: WorkoutTemplate,
    replaceCurrentWorkout = false,
  ): string | null {
    if (
      !replaceCurrentWorkout &&
      (currentWorkout.name.trim() || currentWorkout.exercises.length > 0)
    ) {
      return "You have an unfinished workout.";
    }

    if (
      template.exercises.length === 0 ||
      template.exercises.some(
        (item) =>
          !exerciseList.some((exercise) => exercise.id === item.exerciseId) ||
          !Number.isInteger(item.sets) ||
          item.sets < 1 ||
          item.sets > 100,
      )
    )
      return "This template has missing exercises or invalid set counts. Edit it before starting.";

    setWorkoutName(template.name);

    setExercises(
      template.exercises.map((templateExercise) => {
        const exercise = exerciseList.find(
          (item) => item.id === templateExercise.exerciseId,
        );

        return {
          exerciseId: exercise!.id,
          name: exercise!.name,
          sets: Array.from({ length: templateExercise.sets }, () => ({
            weight: "",
            reps: "",
          })),
        };
      }),
    );

    setActiveTab("log");
    document.getElementById("panel-log")?.focus();

    return null;
  }

  function handleFinishWorkout(): string | null {
    const validationError = validateWorkout(currentWorkout);
    if (validationError) return validationError;

    const newWorkout: Workout = {
      id: crypto.randomUUID(),
      name: workoutName.trim(),
      date: new Date().toISOString(),
      exercises,
    };

    const newPRs = findNewPersonalRecords(workouts, newWorkout);

    const nextWorkouts = [...workouts, newWorkout];
    // Confirm history is saved before clearing the separately persisted draft.
    try {
      localStorage.setItem("workouts", JSON.stringify(nextWorkouts));
    } catch {
      return "Could not save workout history. Your unfinished workout has been kept. Allow browser storage or free space, then try again.";
    }
    setWorkouts(nextWorkouts);
    clearWorkout();

    setPrAlerts([]);
    focusNextPanel.current = true;
    setActiveTab("history");
    if (newPRs.length > 0) {
      setPrAlerts(
        newPRs.map((record) => ({
          exerciseId: record.exerciseId,
          exerciseName:
            exerciseList.find((item) => item.id === record.exerciseId)?.name ??
            "Exercise",
          weight: record.weight,
          reps: record.reps,
        })),
      );
    }

    return null;
  }

  function handleDeleteTemplate(templateId: string) {
    setTemplates((currentTemplates) =>
      currentTemplates.filter((template) => template.id !== templateId),
    );
  }

  function handleUpdateTemplate(template: WorkoutTemplate) {
    setTemplates((currentTemplates) =>
      currentTemplates.map((item) =>
        item.id === template.id ? template : item,
      ),
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="border-b border-neutral-800 bg-neutral-900/60">
        <div className="mx-auto max-w-4xl px-6 py-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Strength training log
          </p>
          <h1 className="text-2xl font-bold text-neutral-50">
            Workout Tracker
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 p-6">
        {[
          exerciseStorageError,
          workoutStorageError,
          templateStorageError,
          currentWorkoutStorageError,
        ].some(Boolean) && (
          <div
            role="alert"
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200"
          >
            {[
              exerciseStorageError,
              workoutStorageError,
              templateStorageError,
              currentWorkoutStorageError,
            ]
              .filter(Boolean)
              .map((message) => (
                <p key={message}>{message}</p>
              ))}
          </div>
        )}
        {prAlerts.length > 0 && (
          <div
            role="status"
            className="flex items-start justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"
          >
            <div className="min-w-0 wrap-anywhere space-y-1">
              <p className="font-semibold text-amber-400">
                🎉 New personal record{prAlerts.length > 1 ? "s" : ""}!
              </p>

              <ul className="space-y-0.5 text-sm text-amber-200/90">
                {prAlerts.map((alert) => (
                  <li key={alert.exerciseId}>
                    {alert.exerciseName}: {alert.weight} kg × {alert.reps}
                  </li>
                ))}
              </ul>
            </div>

            <Button variant="ghost" onClick={() => setPrAlerts([])}>
              Dismiss
            </Button>
          </div>
        )}

        {(canLoadDemo || hasDemoData) && (
          <section aria-label="Demo data" className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="font-semibold text-neutral-100">
              {hasDemoData ? "You’re exploring demo data" : "Try the tracker with sample data"}
            </p>
            <p className="text-sm text-neutral-400">
              {hasDemoData
                ? "Sample workouts and templates are labelled Demo. You can edit them or log your own workouts."
                : "Load 9 workouts across 3 weeks and 3 templates to explore statistics, charts and history."}
            </p>
            {canLoadDemo && <Button variant="primary" onClick={loadDemoData}>Load demo data</Button>}
            {hasDemoData && (confirmClearDemo ? (
              <div className="space-y-3">
                <p className="text-sm text-neutral-200">Remove demo workouts and templates, including edits to those samples? Your own workouts, templates, unfinished workout and exercise library will be kept.</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="danger" onClick={clearDemoData}>Confirm removal</Button>
                  <Button onClick={() => setConfirmClearDemo(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setConfirmClearDemo(true)}>Clear demo data</Button>
            ))}
          </section>
        )}
        <p role="status" className="text-sm text-neutral-400">{demoMessage}</p>

        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        {TABS.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeTab !== tab.id}
            tabIndex={0}
            className="focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            {activeTab === tab.id && (
              <>
                {activeTab === "dashboard" && (
                  <Dashboard workouts={workouts} exerciseList={exerciseList} />
                )}

                {activeTab === "log" && (
                  <div className="space-y-6">
                    <WorkoutEditor
                      workoutName={workoutName}
                      setWorkoutName={setWorkoutName}
                      exercises={exercises}
                      selectedExercise={selectedExercise}
                      setSelectedExercise={setSelectedExercise}
                      exerciseList={exerciseList}
                      workouts={workouts}
                      addExercise={addExercise}
                      updateSet={updateSet}
                      addSet={addSet}
                      removeSet={removeSet}
                      removeExercise={removeExercise}
                      onSaveTemplate={handleSaveTemplate}
                      onFinishWorkout={handleFinishWorkout}
                      onClearWorkout={handleClearWorkout}
                    />

                    <WorkoutTemplates
                      templates={templates}
                      exerciseList={exerciseList}
                      onStartWorkout={handleStartWorkout}
                      onUpdateTemplate={handleUpdateTemplate}
                      onDeleteTemplate={handleDeleteTemplate}
                    />
                  </div>
                )}

                {activeTab === "history" && (
                  <WorkoutHistory
                    workouts={workouts}
                    deleteWorkout={deleteWorkout}
                  />
                )}

                {activeTab === "exercises" && (
                  <ExerciseLibrary
                    exerciseList={exerciseList}
                    setExerciseList={setExerciseList}
                    selectedExercise={selectedExercise}
                    currentExercises={exercises}
                    templates={templates}
                    workouts={workouts}
                  />
                )}
              </>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
