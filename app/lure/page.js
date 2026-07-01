import { cookies } from 'next/headers';
import { getCurrentUser } from 'aws-amplify/auth/server';

import LureClient from './LureClient';
import { AuthProvider } from './auth/AuthProvider';
import { runWithAmplifyServerContext, isAuthConfigured } from './lib/amplifyServerUtils';
import { getProfile } from './actions/profile';

export const metadata = {
  title: 'Lure — SARLAK',
  description:
    'A swipeable feed of short audio. Eight second previews built to hook you, '
    + 'then they play straight on into the full piece.',
};

// Resolve the signed-in user on the server by reading the httpOnly session
// cookies. Runs on every request (cookies() makes the page dynamic), so after a
// hosted-UI sign-in or sign-out redirect the feed renders with the right state.
async function getInitialUser() {
  if (!isAuthConfigured) return null;
  try {
    return await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => {
        const current = await getCurrentUser(contextSpec);
        return { userId: current.userId, username: current.username };
      },
    });
  } catch (error) {
    return null;
  }
}

export default async function LurePage() {
  const initialUser = await getInitialUser();
  const initialProfile = initialUser ? await getProfile() : null;
  return (
    <AuthProvider
      initialUser={initialUser}
      initialProfile={initialProfile}
      authEnabled={isAuthConfigured}
    >
      <LureClient />
    </AuthProvider>
  );
}
