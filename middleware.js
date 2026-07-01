import { NextResponse } from 'next/server';
import { fetchAuthSession } from 'aws-amplify/auth/server';

import { runWithAmplifyServerContext } from './app/lure/lib/amplifyServerUtils';

// Keeps the Lure session alive. On each matched request it runs fetchAuthSession
// inside the server context, which refreshes an expired access token using the
// httpOnly refresh cookie and writes the rotated tokens back onto the response
// (a plain server component render gets read-only cookies and cannot do this, so
// the refresh has to happen here).

export async function middleware(request) {
  const response = NextResponse.next();
  await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        await fetchAuthSession(contextSpec);
      } catch (error) {
        // Not signed in, or refresh failed; the app handles the signed-out state.
      }
    },
  });
  return response;
}

export const config = {
  matcher: ['/lure'],
};
