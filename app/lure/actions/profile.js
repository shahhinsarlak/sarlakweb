'use server';
import { cookies } from 'next/headers';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/api';

import outputs from '../../../amplify_outputs.json';

// Server-side profile access for Lure. Same BFF pattern as engagement: the
// Amplify Data client reads the httpOnly session cookies, so owner-based
// authorization scopes UserProfile to the signed-in user. There is one profile
// per account (the first row), created on first save.

const client = generateServerClientUsingCookies({
  config: outputs,
  cookies,
  authMode: 'userPool',
});

function normaliseHandle(raw) {
  return String(raw || '').trim().replace(/^@+/, '').toLowerCase();
}

function shape(row) {
  if (!row) return null;
  return {
    id: row.id,
    handle: row.handle,
    displayName: row.displayName || '',
    bio: row.bio || '',
  };
}

export async function getProfile() {
  try {
    const res = await client.models.UserProfile.list();
    return shape((res.data || [])[0]);
  } catch (error) {
    return null;
  }
}

// Atomically claim a handle by creating a HandleClaim whose primary key IS the
// handle. DynamoDB rejects a duplicate key, so the first claimer wins. If our own
// create fails, an owner-scoped get that returns a row means the handle is already
// ours; otherwise it belongs to someone else.
async function claimHandle(handle) {
  try {
    const created = await client.models.HandleClaim.create({ handle });
    if (created.data) return true;
  } catch (error) {
    // fall through to the ownership check
  }
  try {
    const mine = await client.models.HandleClaim.get({ handle });
    if (mine.data) return true;
  } catch (error) {
    // treat as taken
  }
  return false;
}

export async function saveProfile(input) {
  const handle = normaliseHandle(input && input.handle);
  const displayName = String((input && input.displayName) || '').trim();
  const bio = String((input && input.bio) || '').trim();

  if (handle.length < 2 || handle.length > 30 || !/^[a-z0-9._]+$/.test(handle)) {
    return { error: 'Handle must be 2 to 30 characters: letters, numbers, dots or underscores.' };
  }
  if (displayName.length > 60) {
    return { error: 'Display name must be 60 characters or fewer.' };
  }
  if (bio.length > 280) {
    return { error: 'Bio must be 280 characters or fewer.' };
  }

  try {
    const res = await client.models.UserProfile.list();
    const existing = (res.data || [])[0];
    const oldHandle = existing ? existing.handle : null;

    if (oldHandle !== handle) {
      // Claim the new handle before writing it; reject if someone else holds it.
      const claimed = await claimHandle(handle);
      if (!claimed) {
        return { error: 'That handle is taken. Try another.' };
      }
      if (oldHandle) {
        try {
          await client.models.HandleClaim.delete({ handle: oldHandle });
        } catch (error) {
          // best-effort release
        }
      }
    } else {
      // Same handle: backfill a claim for profiles created before HandleClaim.
      await claimHandle(handle);
    }

    const fields = { handle, displayName: displayName || null, bio: bio || null };
    const saved = existing
      ? await client.models.UserProfile.update({ id: existing.id, ...fields })
      : await client.models.UserProfile.create(fields);
    if (!saved.data) return { error: 'Could not save your profile. Try again.' };
    return { profile: shape(saved.data) };
  } catch (error) {
    return { error: 'Could not save your profile. Try again.' };
  }
}
