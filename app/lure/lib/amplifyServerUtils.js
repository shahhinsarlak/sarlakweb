import { createServerRunner } from '@aws-amplify/adapter-nextjs';

import outputs from '../../../amplify_outputs.json';

// Server-side Amplify runner for Lure.
//
// This is the server half of the BFF: `runWithAmplifyServerContext` runs Amplify
// Auth/Data operations inside a Next.js server context (reading the httpOnly token
// cookies), and `createAuthRouteHandlers` powers the /api/auth routes that drive
// the hosted-UI sign-in/out flow and set the httpOnly cookies. Import this only
// from server code (route handlers, server actions, middleware, server components).

export const isAuthConfigured = Boolean(outputs && outputs.auth && outputs.auth.user_pool_id);

export const { runWithAmplifyServerContext, createAuthRouteHandlers } = createServerRunner({
  config: outputs,
});
