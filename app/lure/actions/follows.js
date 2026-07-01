'use server';
import { cookies } from 'next/headers';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/api';

import outputs from '../../../amplify_outputs.json';

// Server-side follow state for Lure. Same BFF pattern as engagement: the Amplify
// Data client reads the httpOnly session, owner auth scopes Follow rows to the
// signed-in user. One row per (user, creator). Drives the Following feed.

const client = generateServerClientUsingCookies({
  config: outputs,
  cookies,
  authMode: 'userPool',
});

export async function getFollows() {
  try {
    const res = await client.models.Follow.list();
    return (res.data || []).map((row) => row.creatorId);
  } catch (error) {
    return [];
  }
}

export async function toggleFollow(creatorId) {
  try {
    const existing = await client.models.Follow.list({ filter: { creatorId: { eq: creatorId } } });
    const row = (existing.data || [])[0];
    if (row) {
      await client.models.Follow.delete({ id: row.id });
      return { active: false };
    }
    await client.models.Follow.create({ creatorId });
    return { active: true };
  } catch (error) {
    return { active: null, error: true };
  }
}

export async function mergeLocalFollows(localFollows) {
  try {
    const res = await client.models.Follow.list();
    const have = new Set((res.data || []).map((row) => row.creatorId));
    await Promise.all(
      (localFollows || [])
        .filter((creatorId) => !have.has(creatorId))
        .map((creatorId) => client.models.Follow.create({ creatorId })),
    );
  } catch (error) {
    // best-effort merge
  }
  return getFollows();
}
