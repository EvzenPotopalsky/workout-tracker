# Workout Tracker

A strength-training tracker built with React, TypeScript, Vite and Tailwind CSS. Log workouts, reuse workout templates and review your progress.

Built to practise React state management, reusable components, form validation and browser storage.

## Features

- Load optional demo workouts and templates to explore the app.
- Log exercises, weights and reps.
- Automatically save unfinished workouts.
- Create, edit and reuse workout templates.
- Review workout history and estimated personal records.
- View workout statistics and progress charts.
- Add and search exercises.
- Use keyboard-accessible navigation and labelled forms.

## Run locally

Use Node.js 24 and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. No backend, account or API key is required.

## Try the demo

On an empty tracker, select **Load demo data**. This adds nine workouts across
three weeks and three templates (Push, Pull and Legs), with dates relative to
the day you load them. Explore Dashboard for statistics, charts and records,
History for logged sets, and Log for reusable templates.

Samples are labelled **Demo** and saved in localStorage. Loading is available
only when there are no workouts, templates or unfinished workout, and storage
has no reported errors. Existing exercises are reused by name; missing ones
are added. **Clear demo data** asks for confirmation and removes only demo
workouts and templates, including any edits to those samples. Your own data,
unfinished workout and exercise library are kept. Workouts you finish from a
demo template are your own workouts and are kept too.

## Commands

| Command             | Purpose                      |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start the development server |
| `npm run build`     | Type-check and build the app |
| `npm run preview`   | Preview the production build |
| `npm run lint`      | Run ESLint                   |
| `npm test -- --run` | Run tests once               |

## Project structure

- `components/` — workout screens and reusable UI components.
- `hooks/` — browser storage and current-workout management.
- `lib/` — validation, statistics and personal-record calculations.
- `types/` — shared TypeScript types.

## Data and limitations

Data is saved in localStorage in the current browser. It is not synced between devices or backed up, and clearing site data removes it. Storage problems are shown in the interface.

Workout volume is calculated as weight × reps. Strength records use an estimated one-rep maximum rather than a measured maximum.

## Tests

Vitest tests cover validation, workout calculations, storage handling and key interface behaviour.

## Deployment

Run `npm run build` and deploy the generated `dist/` folder to a static host.
