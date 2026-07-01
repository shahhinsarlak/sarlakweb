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

## 3. Run the app locally
The app reads its backend config from the committed `amplify_outputs.json` (public config only:
pool ids, the AppSync URL, the hosted-UI OAuth domain and the schema, the same values that ship
to the browser, no secrets). Sign-in runs server-side through Cognito's hosted UI, which needs
one environment variable: the app's own origin. For local dev, `.env.local` already sets it:

    AMPLIFY_APP_ORIGIN=http://localhost:3000

Then:

    npm run dev

Open http://localhost:3000/lure and click "Sign in". You are redirected to the Cognito hosted
page (email/password), then back to the app, where the server exchanges the code and sets the
httpOnly session cookies. Likes and saves made while signed out are merged into the account on
first sign-in.

> After any auth or schema change and redeploy, commit the updated `amplify_outputs.json` so the
> deployed site picks it up.

## 4. Deploy to Amplify Hosting (production)
The committed `amplify_outputs.json` connects the deployed site to this backend, so the existing
frontend-only `amplify.yml` builds it with no backend phase.

**Required once:** in the Amplify console, App settings -> Environment variables, add

    AMPLIFY_APP_ORIGIN = https://sarlak.au

The server-side auth route reads it at build and at runtime; without it the Amplify build fails
at page-data collection. Use the canonical domain (`sarlak.au`); Cognito already allows the
sign-in/out callbacks for `sarlak.au`, `www.sarlak.au`, the amplifyapp default and localhost.

> Tradeoff: the deployed site talks to the personal sandbox backend. Fine for a prototype. For a
> real per-branch backend (so production does not depend on a personal sandbox), enable the
> branch backend in the Amplify console with a deploy service role and add a backend phase to
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
- Sign-in uses Cognito's hosted UI over the OAuth authorization-code + PKCE flow. The token
  exchange happens server-side in `/api/auth/sign-in-callback`, which sets the id, access and
  refresh tokens as httpOnly, Secure cookies the browser JS can never read (closes the XSS
  token-theft hole).
- All authenticated data access (likes, saves) runs in server actions against the httpOnly
  session; the browser never holds a token. This is the BFF pattern, and the same shape future
  metrics capture and feed ranking will use.
- `middleware.js` refreshes the session (rotating the httpOnly cookies) so logins survive access
  token expiry.
- Passwords are handled entirely by Cognito (salted hash). Cognito, DynamoDB and the API are
  encrypted at rest (KMS) and in transit (TLS). Every data model uses owner-based authorization.
- Still to do before a public launch: turn on Cognito threat protection (compromised-credential
  blocking + adaptive MFA, a paid add-on) and require MFA.
