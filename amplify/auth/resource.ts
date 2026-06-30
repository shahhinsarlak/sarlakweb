import { defineAuth } from '@aws-amplify/backend';

/**
 * Cognito auth for Lure.
 *
 * Email sign-in with a verification email, self-service password recovery and
 * the default strong password policy. MFA is left optional for the prototype;
 * flip `multifactor.mode` to 'REQUIRED' (and enable threat protection in the
 * Cognito console) before a public launch. Passwords are only ever stored as a
 * salted hash by Cognito, and with the SRP flow they never cross the network.
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailSubject: 'Your Lure verification code',
      verificationEmailBody: (createCode: () => string) =>
        `Welcome to Lure. Your verification code is ${createCode()}.`,
    },
  },
  accountRecovery: 'EMAIL_ONLY',
  multifactor: {
    mode: 'OPTIONAL',
    totp: true,
  },
});
