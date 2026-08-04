import { onAuthStateChanged, signOut, type User } from 'firebase/auth';

import { auth } from '@/config/firebase';

export type AuthSessionEndReason = 'session-expired';

export type AuthSessionSnapshot = {
  generation: number;
  user: User | null;
};

type AuthSessionEndReasonListener = (
  reason: AuthSessionEndReason | null,
) => void;

const terminalAuthErrorCodes = new Set([
  'auth/invalid-user-token',
  'auth/user-disabled',
  'auth/user-not-found',
  'auth/user-token-expired',
]);

const sessionEndReasonListeners = new Set<AuthSessionEndReasonListener>();

let currentSessionEndReason: AuthSessionEndReason | null = null;
let currentSessionEndReasonGeneration: number | null = null;
let authSessionGeneration = 0;
let authStateInitialized = false;
let resolveAuthStateReady: (() => void) | null = null;

const authStateReadyPromise = new Promise<void>((resolve) => {
  resolveAuthStateReady = resolve;
});
const refreshPromises = new Map<
  number,
  Promise<{ token: string; uid: string }>
>();
const expiredSessionSignOutPromises = new Map<number, Promise<void>>();

onAuthStateChanged(auth, () => {
  authSessionGeneration += 1;

  if (!authStateInitialized) {
    authStateInitialized = true;
    resolveAuthStateReady?.();
    resolveAuthStateReady = null;
  }
});

function publishSessionEndReason(
  reason: AuthSessionEndReason | null,
  generation: number | null = null,
): void {
  currentSessionEndReason = reason;
  currentSessionEndReasonGeneration = generation;

  sessionEndReasonListeners.forEach((listener) => listener(reason));
}

export function subscribeToAuthSessionEndReason(
  listener: AuthSessionEndReasonListener,
): () => void {
  sessionEndReasonListeners.add(listener);
  listener(currentSessionEndReason);

  return () => {
    sessionEndReasonListeners.delete(listener);
  };
}

export function clearAuthSessionEndReason(): void {
  if (currentSessionEndReason !== null) {
    publishSessionEndReason(null);
  }
}

export async function getCurrentAuthSession(): Promise<AuthSessionSnapshot> {
  if (!authStateInitialized) {
    await authStateReadyPromise;
  }

  return {
    generation: authSessionGeneration,
    user: auth.currentUser,
  };
}

export function isCurrentAuthSession(
  generation: number,
  uid: string,
): boolean {
  return (
    authSessionGeneration === generation && auth.currentUser?.uid === uid
  );
}

export function isTerminalAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = (error as { code?: unknown }).code;

  return typeof code === 'string' && terminalAuthErrorCodes.has(code);
}

export async function refreshCurrentUserToken(
  generation: number,
  uid: string,
): Promise<string | null> {
  const currentUser = auth.currentUser;

  if (!currentUser || !isCurrentAuthSession(generation, uid)) {
    return null;
  }

  let refreshPromise = refreshPromises.get(generation);

  if (!refreshPromise) {
    refreshPromise = currentUser
      .getIdToken(true)
      .then((token) => ({ token, uid }))
      .finally(() => {
        refreshPromises.delete(generation);
      });

    refreshPromises.set(generation, refreshPromise);
  }

  const refreshedToken = await refreshPromise;

  return isCurrentAuthSession(generation, refreshedToken.uid)
    ? refreshedToken.token
    : null;
}

export function expireAuthSession(
  generation: number,
  uid: string,
): Promise<void> {
  if (!isCurrentAuthSession(generation, uid)) {
    return Promise.resolve();
  }

  const existingSignOutPromise = expiredSessionSignOutPromises.get(generation);

  if (existingSignOutPromise) {
    return existingSignOutPromise;
  }

  publishSessionEndReason('session-expired', generation);

  const signOutPromise = signOut(auth)
    .catch((error: unknown) => {
      if (currentSessionEndReasonGeneration === generation) {
        publishSessionEndReason(null);
      }

      throw error;
    })
    .finally(() => {
      expiredSessionSignOutPromises.delete(generation);
    });

  expiredSessionSignOutPromises.set(generation, signOutPromise);

  return signOutPromise;
}
