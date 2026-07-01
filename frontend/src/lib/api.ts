import axios, { AxiosHeaders } from 'axios';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { auth } from '@/config/firebase';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

let authReadyPromise: Promise<User | null> | null = null;

function waitForAuthReady(): Promise<User | null> {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }

  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  return authReadyPromise;
}

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser ?? (await waitForAuthReady());

  if (user) {
    const token = await user.getIdToken();
    const headers = AxiosHeaders.from(config.headers);

    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});
