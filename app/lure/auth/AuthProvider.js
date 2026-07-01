'use client';
import { createContext, useContext, useState } from 'react';

// Auth state for Lure, server-driven.
//
// With the httpOnly server-side flow the browser cannot read tokens, so the
// signed-in user is resolved on the server (in page.js) and passed in as
// `initialUser`. Sign-in and sign-out are plain navigations to the /api/auth
// routes, which run the hosted-UI OAuth flow and set or clear the httpOnly
// cookies. This provider holds no tokens and makes no Amplify calls.

const AuthContext = createContext(null);

export function AuthProvider({ initialUser, initialProfile, authEnabled, children }) {
  const [profile, setProfile] = useState(initialProfile || null);
  const value = {
    user: initialUser || null,
    profile,
    setProfile,
    isBackendConfigured: Boolean(authEnabled),
    signInHref: '/api/auth/sign-in',
    signUpHref: '/api/auth/sign-up',
    signOutHref: '/api/auth/sign-out',
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
