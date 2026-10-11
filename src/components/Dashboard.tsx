import { useState } from "react";
import type { Exercise, Workout } from "@/types/workout";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import LineChart from "@/components/LineChart";
import SelectField from "@/components/SelectField";
import StatCard from "@/components/StatCard";
import { computePersonalRecords } from "@/lib/personalRecords";
import {
  computeCurrentStreakDays,
  computeExerciseProgression,
  computeVolumeSeries,
  computeWorkoutsThisWeek,
} from "@/lib/workoutStats";

type DashboardProps = {
  workouts: Workout[];
  exerciseList: Exercise[];
};

const VOLUME_FORMATTER = new Intl.NumberFormat("en-GB");

export default function Dashboard({ workouts, exerciseList }: DashboardProps) {
  const [progressionExerciseState, setProgressionExercise] = useState(
    () => exerciseList[0]?.id ?? "",
  );

  const progressionExercise = exerciseList.some(
    (exercise) => exercise.id === progressionExerciseState,
  )
    ? progressionExerciseState
    : (exerciseList[0]?.id ?? "");

  if (workouts.length === 0) {
    return (
      <Card title="Dashboard" description="An overview of your training.">
        <EmptyState>
          Log your first workout to start seeing stats here.
        </EmptyState>
      </Card>
    );
  }

  const { records } = computePersonalRecords(workouts);
  const recentPRs = Object.values(records)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const allVolume = computeVolumeSeries(workouts);
  const volumeSeries = allVolume.slice(-10);
  const totalVolumeEver = allVolume.reduce(
    (total, point) => total + point.volume,
    0,
  );
  const streakDays = computeCurrentStreakDays(workouts);
  const workoutsThisWeek = computeWorkoutsThisWeek(workouts);
  const progressionSeries = computeExerciseProgression(
    workouts,
    progressionExercise,
  );

  return (
    <div className="space-y-6">
      <Card title="Dashboard" description="An overview of your training.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total workouts" value={String(workouts.length)} />
          <StatCard label="This week" value={String(workoutsThisWeek)} />
          <StatCard
            label="Current streak"
            value={`${streakDays} ${streakDays === 1 ? "day" : "days"}`}
          />
          <StatCard
            label="Total volume"
            value={`${VOLUME_FORMATTER.format(Math.round(totalVolumeEver))} kg`}
          />
        </div>
      </Card>

      <Card
        title="Volume trend"
        description="Total weight lifted per workout, last 10 sessions."
      >
        {volumeSeries.length < 2 ? (
          <EmptyState>
            Log a few more workouts to see a volume trend.
          </EmptyState>
        ) : (
          <div className="h-32">
            <LineChart
              label="Workout volume trend, in kilograms"
              description={volumeSeries
                .map(
                  (point) =>
                    `${new Date(point.date).toLocaleDateString("en-GB")}: ${point.volume} kg`,
                )
                .join("; ")}
              data={volumeSeries.map((point) => point.volume)}
            />
          </div>
        )}
      </Card>

      <Card
        title="Exercise progression"
        description="Estimated one-rep max over time (Epley formula)."
      >
        <div className="space-y-4">
          <SelectField
            label="Exercise"
            value={progressionExercise}
            onChange={(event) => setProgressionExercise(event.target.value)}
          >
            {exerciseList.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </SelectField>

          {progressionSeries.length < 2 ? (
            <EmptyState>
              Not enough logged sets for this exercise yet to show a trend.
            </EmptyState>
          ) : (
            <div className="h-32">
              <LineChart
                label="Estimated one-rep max progression, in kilograms"
                description={progressionSeries
                  .map(
                    (point) =>
                      `${new Date(point.date).toLocaleDateString("en-GB")}: ${point.estimatedOneRepMax} kg`,
                  )
                  .join("; ")}
                data={progressionSeries.map(
                  (point) => point.estimatedOneRepMax,
                )}
                color="#818cf8"
              />
            </div>
          )}
        </div>
      </Card>

      <Card title="Recent personal records" description="Your latest PRs.">
        {recentPRs.length === 0 ? (
          <EmptyState>No personal records yet — go set one.</EmptyState>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {recentPRs.map((record) => {
              const exercise = exerciseList.find(
                (item) => item.id === record.exerciseId,
              );

              return (
                <li
                  key={record.exerciseId}
                  className="flex items-center justify-between gap-2 py-2 text-sm"
                >
                  <span className="text-neutral-200">
                    {exercise?.name ??
                      workouts
                        .find((workout) => workout.id === record.workoutId)
                        ?.exercises.find(
                          (item) => item.exerciseId === record.exerciseId,
                        )?.name ??
                      "Unknown exercise"}
                  </span>
                  <span className="text-neutral-400">
                    {record.weight} kg × {record.reps}
                    <span className="text-neutral-400">
                      {" "}
                      · est. 1RM {Math.round(record.estimatedOneRepMax)} kg
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
