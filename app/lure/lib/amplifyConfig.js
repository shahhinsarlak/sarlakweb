'use client';
import { Amplify } from 'aws-amplify';

// Build-safe Amplify configuration.
//
// Reads Cognito and AppSync details from public env vars, so the app still
// builds and runs fully anonymously when the backend is not yet connected
// (every var simply resolves to undefined). Once `npx ampx sandbox` or a deploy
// has populated these, auth and data light up. See docs/PHASE1_SETUP.md.
//
// `ssr: true` keeps tokens in cookies rather than localStorage, which both
// resists XSS token theft and lets the Next.js server adapter read the session
// later for full httpOnly hardening.

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
const identityPoolId = process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID;
const region = process.env.NEXT_PUBLIC_AWS_REGION;
const graphqlEndpoint = process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT;

export const isBackendConfigured = Boolean(userPoolId && userPoolClientId && region);

let configured = false;

export function configureAmplify() {
  if (configured || !isBackendConfigured) return isBackendConfigured;

  const config = {
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        identityPoolId,
        loginWith: { email: true },
      },
    },
  };

  if (graphqlEndpoint) {
    config.API = {
      GraphQL: {
        endpoint: graphqlEndpoint,
        region,
        defaultAuthMode: 'userPool',
      },
    };
  }

  Amplify.configure(config, { ssr: true });
  configured = true;
  return true;
}
