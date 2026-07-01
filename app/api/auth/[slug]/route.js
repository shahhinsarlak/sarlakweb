import { createAuthRouteHandlers } from '../../../lure/lib/amplifyServerUtils';

// The Amplify hosted-UI auth routes, all under /api/auth/<slug>:
//   sign-in, sign-up            -> redirect to the Cognito hosted page
//   sign-in-callback            -> exchange the code for tokens, set httpOnly cookies
//   sign-out, sign-out-callback -> clear the cookies and end the hosted session
// Only GET is handled; the token exchange runs server-side so tokens never touch
// client JavaScript.

export const GET = createAuthRouteHandlers({
  redirectOnSignInComplete: '/lure',
  redirectOnSignOutComplete: '/lure',
});
