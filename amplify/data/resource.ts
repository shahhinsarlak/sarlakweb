import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Data models for Lure, Phase 1.
 *
 * Every model uses owner-based authorization: the `owner` field is filled from
 * the Cognito identity, and `allow.owner()` means a user can only read and
 * write their own rows. DynamoDB encrypts all of it at rest with KMS, and the
 * GraphQL API is HTTPS only.
 *
 * The audio catalogue itself still lives in the seeded data for now; only the
 * per-user signals (profile, likes, saves) are persisted here in this slice.
 */
const schema = a.schema({
  UserProfile: a
    .model({
      handle: a.string().required(),
      displayName: a.string(),
      bio: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  Like: a
    .model({
      postId: a.string().required(),
    })
    .authorization((allow) => [allow.owner()]),

  Save: a
    .model({
      postId: a.string().required(),
    })
    .authorization((allow) => [allow.owner()]),

  // Which creators a user follows, one row per (user, creator). Drives the
  // Following feed. Owner auth scopes rows to the signed-in user.
  Follow: a
    .model({
      creatorId: a.string().required(),
    })
    .authorization((allow) => [allow.owner()]),

  // Enforces globally unique handles. `handle` is the primary key, so
  // HandleClaim.create fails atomically (DynamoDB conditional write) when a
  // handle is already taken. Owner auth lets a user read/release only their own
  // claim; create is open to any signed-in user but the key collision is what
  // guarantees first-claimer-wins. See app/lure/actions/profile.js.
  HandleClaim: a
    .model({
      handle: a.string().required(),
    })
    .identifier(['handle'])
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
