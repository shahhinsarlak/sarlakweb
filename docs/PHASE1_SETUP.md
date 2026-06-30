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

This provisions a Cognito user pool, AppSync API and DynamoDB tables in your account, and
writes `amplify_outputs.json` at the repo root. Leave it running; it redeploys on change. The
backend resources persist after you stop the watcher; only `npx ampx sandbox delete` tears
them down.

## 3. Run the app
The Lure client reads `amplify_outputs.json` directly (it holds public config only: pool ids,
the AppSync URL and the schema, the same values that ship to the browser, no secrets). That
file is committed, so the app is already wired. Just run:

    npm run dev

Open http://localhost:3000/lure. A "Sign in" button appears in the top bar. Create an account,
verify with the emailed code, and your likes and saves persist to the account. Any you made
while signed out are merged up on first sign-in.

> After any schema change and redeploy, commit the updated `amplify_outputs.json` so the
> deployed site picks it up. (`npm run sync:lure-env` still exists if you prefer env vars, but
> the client no longer needs them.)

## 4. Deploy to Amplify Hosting (production)
The simplest path, used now: the committed `amplify_outputs.json` connects the deployed site to
this backend, so the existing frontend-only `amplify.yml` just works, no extra console setup.

> Tradeoff: the deployed site talks to the sandbox backend. Fine for a prototype. For a real
> per-branch backend (so production does not depend on a personal sandbox), enable the branch
> backend in the Amplify console with a deploy service role and add a backend phase to
> `amplify.yml`:

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

With that, `ampx pipeline-deploy` regenerates `amplify_outputs.json` in the build environment
before the Next build, overriding the committed one with the branch backend.

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
