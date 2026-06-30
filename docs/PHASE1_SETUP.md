# Lure Phase 1 — backend setup (Amplify Gen 2)

Phase 1 adds accounts and per-user data (likes, saves, profile) on AWS. The backend is
defined in `amplify/` (Cognito for auth, AppSync over DynamoDB for data). The app keeps
working fully anonymously until these values are present, so none of this is required just to
run the prototype, and nothing here changes the current deploy until you opt in.

## What you need
- An AWS account and local credentials (`aws configure`, or an AWS profile).
- Node 18+ (already used by the site).

## 1. Approve native install scripts (npm 11)
npm 11 skips some postinstall scripts by default. `ampx` needs esbuild, so allow them once:

    npm approve-scripts esbuild @parcel/watcher

## 2. Stand up a personal cloud sandbox
From the repo root:

    npx ampx sandbox

This provisions a throwaway Cognito user pool, AppSync API and DynamoDB tables tied to your
machine, and writes `amplify_outputs.json` (gitignored). Leave it running; it redeploys on
change.

## 3. Point the app at the sandbox
The Lure client reads its config from `NEXT_PUBLIC_*` env vars. Generate a `.env.local` from
the outputs, then run the dev server:

    npm run sync:lure-env
    npm run dev

Open http://localhost:3000/lure. A "Sign in" button now appears in the top bar. Create an
account, verify with the emailed code, and your likes and saves persist to the account. Any
you made while signed out are merged up on first sign-in.

> `NEXT_PUBLIC_*` vars are inlined at build time, so they must be set before `npm run build`,
> not only at runtime.

## 4. Deploy to Amplify Hosting (production)
In the Amplify console, enable this branch's backend. Then update `amplify.yml` so the build
provisions the backend and wires the env vars before the Next build:

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - npm ci --cache .npm --prefer-offline
        - npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --cache .npm --prefer-offline
    build:
      commands:
        - node scripts/lure-env-from-outputs.mjs
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - .npm/**/*
      - node_modules/**/*
```

`amplify_outputs.json` is produced by `ampx pipeline-deploy` in the build environment, then
the sync script turns it into the `NEXT_PUBLIC_*` vars the client reads.

## Security notes (how this maps to the plan)
- Passwords are handled entirely by Cognito: salted hash, and with the SRP flow they never
  cross the network.
- Cognito, DynamoDB and the API are encrypted at rest (KMS) and in transit (TLS).
- Every data model uses owner-based authorization, so a user can only read and write their own
  rows.
- Tokens are kept in cookies (`ssr: true`), not localStorage. For full httpOnly hardening,
  move to the `@aws-amplify/adapter-nextjs` server runner with middleware. This is the next
  hardening step before a public launch.
- Turn on Cognito threat protection (compromised-credential blocking + adaptive MFA) in the
  console before launch; it is a paid add-on, so it is left off for now.
