# Learning Needs Navigator (LNA)

A guided diagnostic that turns a described workplace performance problem into a
structured recommendation: root-cause analysis, a training vs. non-training split,
a recommended learning approach, an implementation roadmap, and a measurement plan.

## Stack

- React 18 + TypeScript, built with Vite
- Tailwind CSS + shadcn-ui (Radix primitives)
- Supabase (Postgres, Auth, Row-Level Security) — no custom backend server
- Scoring/recommendation logic runs client-side in `src/utils/`

## Repository layout

```
LNA/
├── frontend/   React + Vite app (src/, public/, configs, .env)
└── backend/    supabase/ — config.toml, migrations/, future edge functions
```

## Getting started

```sh
cd frontend
npm install
cp .env.example .env    # then fill in your Supabase project values
npm run dev             # http://localhost:8080
```

Supabase CLI commands (e.g. `supabase db push`) run from `backend/`.

Scripts: `dev`, `build`, `build:dev`, `preview`, `lint`.

## Environment

`.env` holds only frontend-safe values. Everything prefixed `VITE_` is compiled
into the public JavaScript bundle, so **never** put a `service_role` key or any
third-party API key there.

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable (anon) key — public by design, gated by RLS |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ref |

## Database

Schema lives in `backend/supabase/migrations/`. The baseline migration reproduces the
full schema: `profiles`, `reports`, `user_roles`, the `app_role` enum, the
`has_role` / `handle_new_user` / `update_updated_at_column` functions, triggers,
and all RLS policies.

Access control is enforced entirely by Postgres RLS — users can only read their
own `profiles`/`reports`/`user_roles` rows; admins (a row in `user_roles` with
`role = 'admin'`) can additionally read all profiles and roles.

`migrations/_archive_lovable/` contains the earlier migration files from when the
project was hosted on Lovable. They are kept for history only and do not describe
the current schema.

## Application structure

```
frontend/src/
├── pages/         Index, Login, Signup, ResetPassword, Assessment, Results, Admin
├── components/    assessment/, auth/, layout/, ui/ (shadcn)
├── context/       AuthContext — Supabase session state
├── hooks/         useIsAdmin, useAnalytics, useSpeechRecognition
├── data/          sampleData.ts — all assessment segments and questions
├── utils/         assessmentUtils, businessTranslation, measurementPlan (scoring engine)
└── integrations/  supabase/ client + generated types
```
