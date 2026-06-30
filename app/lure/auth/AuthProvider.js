'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  resendSignUpCode,
  signOut as amplifySignOut,
  getCurrentUser,
  fetchUserAttributes,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

import { configureAmplify, isBackendConfigured } from '../lib/amplifyConfig';

// Auth state for Lure. Wraps the Amplify Cognito calls and exposes a small,
// stable surface. When the backend is not configured it stays quietly in
// anonymous mode, so the rest of the app keeps working untouched.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!isBackendConfigured) {
      setUser(null);
      setReady(true);
      return;
    }
    try {
      const current = await getCurrentUser();
      let attributes = {};
      try {
        attributes = await fetchUserAttributes();
      } catch (e) {
        // attributes are best-effort
      }
      setUser({ userId: current.userId, username: current.username, email: attributes.email });
    } catch (e) {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    configureAmplify();
    refresh();
    if (!isBackendConfigured) return undefined;
    const stop = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn' || payload.event === 'signedOut' || payload.event === 'tokenRefresh') {
        refresh();
      }
    });
    return () => stop();
  }, [refresh]);

  const signUp = useCallback(
    (email, password) => amplifySignUp({
      username: email,
      password,
      options: { userAttributes: { email } },
    }),
    [],
  );

  const confirmSignUp = useCallback(
    (email, code) => amplifyConfirmSignUp({ username: email, confirmationCode: code }),
    [],
  );

  const resendCode = useCallback((email) => resendSignUpCode({ username: email }), []);

  const signIn = useCallback(async (email, password) => {
    const result = await amplifySignIn({ username: email, password });
    await refresh();
    return result;
  }, [refresh]);

  const signOut = useCallback(async () => {
    await amplifySignOut();
    setUser(null);
  }, []);

  const value = {
    user,
    ready,
    isBackendConfigured,
    signUp,
    confirmSignUp,
    resendCode,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
