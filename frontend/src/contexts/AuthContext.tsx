import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword as updateFirebasePassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { auth } from '../config/firebase';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  getToken: () => Promise<string | null>;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authRevision, setAuthRevision] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: 'select_account',
    });

    const credential = await signInWithPopup(auth, provider);
    setUser(credential.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await updateProfile(credential.user, {
        displayName: name,
      });

      setUser(credential.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const updateDisplayName = useCallback(async (name: string) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('Usuário não autenticado.');
    }

    await updateProfile(currentUser, {
      displayName: name.trim(),
    });

    setUser(currentUser);
    setAuthRevision((currentRevision) => currentRevision + 1);
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const currentUser = auth.currentUser;

      if (!currentUser?.email) {
        throw new Error('Usuário não autenticado.');
      }

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword,
      );

      await reauthenticateWithCredential(currentUser, credential);
      await updateFirebasePassword(currentUser, newPassword);
      setAuthRevision((currentRevision) => currentRevision + 1);
    },
    [],
  );

  const getToken = useCallback(async () => {
    return auth.currentUser?.getIdToken() ?? null;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      loginWithGoogle,
      register,
      logout,
      resetPassword,
      updateDisplayName,
      changePassword,
      getToken,
    }),
    [
      authRevision,
      changePassword,
      getToken,
      loading,
      login,
      loginWithGoogle,
      logout,
      register,
      resetPassword,
      updateDisplayName,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
