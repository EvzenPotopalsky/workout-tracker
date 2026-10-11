import { useMemo, useState } from "react";
import type { Workout } from "@/types/workout";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { computePersonalRecords, setKey } from "@/lib/personalRecords";

type WorkoutHistoryProps = {
  workouts: Workout[];
  deleteWorkout: (workoutId: string) => void;
};

export default function WorkoutHistory({
  workouts,
  deleteWorkout,
}: WorkoutHistoryProps) {
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [deleteWorkoutId, setDeleteWorkoutId] = useState<string | null>(null);

  const prSetKeys = useMemo(
    () => computePersonalRecords(workouts).prSetKeys,
    [workouts],
  );

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <Card title="Workout history" description="Past sessions, newest first.">
      {sortedWorkouts.length === 0 ? (
        <EmptyState>No workouts logged yet.</EmptyState>
      ) : (
        <div className="divide-y divide-neutral-800">
          {sortedWorkouts.map((workout) => {
            const isExpanded = expandedWorkout === workout.id;

            return (
              <div key={workout.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    className="min-w-0 rounded text-left focus-visible:outline-2 focus-visible:outline-emerald-400"
                    aria-expanded={isExpanded}
                    aria-controls={`history-${workout.id}`}
                    onClick={() =>
                      setExpandedWorkout(isExpanded ? null : workout.id)
                    }
                  >
                    <span className="block wrap-break-word font-semibold text-neutral-50">
                      {workout.name}
                    </span>
                    <span className="text-sm text-neutral-400">
                      {new Date(workout.date).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </button>

                  {deleteWorkoutId === workout.id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-neutral-400">
                        Delete workout?
                      </span>

                      <Button
                        variant="danger"
                        onClick={() => {
                          document.getElementById("panel-history")?.focus();
                          deleteWorkout(workout.id);
                          setDeleteWorkoutId(null);
                        }}
                      >
                        Confirm
                      </Button>

                      <Button onClick={() => setDeleteWorkoutId(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="danger"
                      onClick={() => setDeleteWorkoutId(workout.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>

                <div
                  hidden={!isExpanded}
                  id={`history-${workout.id}`}
                  className="mt-3 space-y-3 rounded-lg bg-neutral-950/60 p-3"
                >
                  {workout.exercises.map((exercise, exerciseIndex) => (
                    <div key={exercise.exerciseId}>
                      <h3 className="text-sm font-semibold text-neutral-50">
                        {exercise.name}
                      </h3>

                      <ul className="mt-1 space-y-0.5 text-sm text-neutral-400">
                        {exercise.sets.map((set, setIndex) => {
                          const isPR = prSetKeys.has(
                            setKey(workout.id, exerciseIndex, setIndex),
                          );

                          return (
                            <li
                              key={setIndex}
                              className="flex flex-wrap items-center gap-2"
                            >
                              <span>
                                Set {setIndex + 1}: {set.weight} kg × {set.reps}
                              </span>
                              {isPR && <Badge>PR</Badge>}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
