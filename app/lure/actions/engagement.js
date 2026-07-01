'use server';
import { cookies } from 'next/headers';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/api';

import outputs from '../../../amplify_outputs.json';

// Server-side data access for Lure's per-user engagement (likes and saves).
//
// These run only on the server. The Amplify Data client reads the httpOnly token
// cookies to authenticate each GraphQL call as the signed-in user, so owner-based
// authorization applies and the browser never holds a token. This is the data
// half of the BFF and the same pattern future event capture and feed ranking use.

const client = generateServerClientUsingCookies({
  config: outputs,
  cookies,
  authMode: 'userPool',
});

export async function getEngagement() {
  try {
    const [likeRes, saveRes] = await Promise.all([
      client.models.Like.list(),
      client.models.Save.list(),
    ]);
    return {
      likes: (likeRes.data || []).map((row) => row.postId),
      saves: (saveRes.data || []).map((row) => row.postId),
    };
  } catch (error) {
    return { likes: [], saves: [] };
  }
}

async function toggle(model, postId) {
  const existing = await model.list({ filter: { postId: { eq: postId } } });
  const row = (existing.data || [])[0];
  if (row) {
    await model.delete({ id: row.id });
    return false;
  }
  await model.create({ postId });
  return true;
}

export async function toggleLike(postId) {
  try {
    return { active: await toggle(client.models.Like, postId) };
  } catch (error) {
    return { active: null, error: true };
  }
}

export async function toggleSave(postId) {
  try {
    return { active: await toggle(client.models.Save, postId) };
  } catch (error) {
    return { active: null, error: true };
  }
}

// Merge anonymous localStorage engagement into the account on first sign-in.
// Only creates rows that are not already present.
export async function mergeLocalEngagement(localLikes, localSaves) {
  try {
    const [likeRes, saveRes] = await Promise.all([
      client.models.Like.list(),
      client.models.Save.list(),
    ]);
    const haveLikes = new Set((likeRes.data || []).map((row) => row.postId));
    const haveSaves = new Set((saveRes.data || []).map((row) => row.postId));

    await Promise.all([
      ...(localLikes || [])
        .filter((postId) => !haveLikes.has(postId))
        .map((postId) => client.models.Like.create({ postId })),
      ...(localSaves || [])
        .filter((postId) => !haveSaves.has(postId))
        .map((postId) => client.models.Save.create({ postId })),
    ]);
  } catch (error) {
    // best-effort merge; ignore failures
  }
  return getEngagement();
}
