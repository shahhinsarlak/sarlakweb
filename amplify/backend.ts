import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.ts';
import { data } from './data/resource.ts';

/**
 * Lure backend (Amplify Gen 2). Provisions Cognito (auth) and an AppSync API
 * over DynamoDB (data). Run `npx ampx sandbox` to stand up a personal cloud
 * sandbox; the Amplify hosting pipeline deploys it per branch. See
 * docs/PHASE1_SETUP.md.
 */
defineBackend({
  auth,
  data,
});
