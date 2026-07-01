import { defineAuth } from '@aws-amplify/backend';

/**
 * Cognito auth for Lure.
 *
 * Email sign-in with a verification email and self-service password recovery.
 * Passwords are only ever stored as a salted hash by Cognito.
 *
 * `externalProviders` turns on the Cognito hosted UI (managed login). We use it
 * even without a social provider so that sign-in runs through the server-side
 * OAuth flow: the browser is redirected to Cognito's hosted page, and the app's
 * /api/auth/sign-in-callback route exchanges the code for tokens and stores them
 * in httpOnly cookies the client JS can never read. MFA stays optional for the
 * prototype; flip to REQUIRED and enable threat protection before a public launch.
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailSubject: 'Your Lure verification code',
      verificationEmailBody: (createCode: () => string) =>
        `Welcome to Lure. Your verification code is ${createCode()}.`,
    },
    externalProviders: {
      callbackUrls: [
        'http://localhost:3000/api/auth/sign-in-callback',
        'https://sarlak.au/api/auth/sign-in-callback',
        'https://www.sarlak.au/api/auth/sign-in-callback',
        'https://main.du6qymh6m8glu.amplifyapp.com/api/auth/sign-in-callback',
      ],
      logoutUrls: [
        'http://localhost:3000/api/auth/sign-out-callback',
        'https://sarlak.au/api/auth/sign-out-callback',
        'https://www.sarlak.au/api/auth/sign-out-callback',
        'https://main.du6qymh6m8glu.amplifyapp.com/api/auth/sign-out-callback',
      ],
      scopes: ['OPENID', 'EMAIL', 'PROFILE'],
    },
  },
  accountRecovery: 'EMAIL_ONLY',
  multifactor: {
    mode: 'OPTIONAL',
    totp: true,
  },
});

