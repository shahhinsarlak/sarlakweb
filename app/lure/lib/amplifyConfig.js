'use client';
import { Amplify } from 'aws-amplify';

import outputs from '../../../amplify_outputs.json';

// Amplify configuration for Lure.
//
// We configure from the full amplify_outputs.json rather than hand-assembled
// env vars, because the Data client (`client.models`) needs the schema's
// `model_introspection`, which only that file carries. The file holds public
// config only (Cognito pool ids, the AppSync URL, the schema), the same values
// that ship to every browser, so it is safe to commit.
//
// `ssr: true` keeps tokens in cookies rather than localStorage, which resists
// XSS token theft and lets the Next.js server adapter read the session later.

export const isBackendConfigured = Boolean(
  outputs && outputs.auth && outputs.auth.user_pool_id,
);

let configured = false;

export function configureAmplify() {
  if (configured || !isBackendConfigured) return isBackendConfigured;
  Amplify.configure(outputs, { ssr: true });
  configured = true;
  return true;
}
