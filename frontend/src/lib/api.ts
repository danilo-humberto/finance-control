import axios, {
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  expireAuthSession,
  getCurrentAuthSession,
  isCurrentAuthSession,
  isTerminalAuthError,
  refreshCurrentUserToken,
} from '@/lib/authSession';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean;
  _authSessionGeneration?: number;
  _authSessionUid?: string;
};

api.interceptors.request.use(async (config) => {
  const requestConfig = config as RetryableRequestConfig;
  const session = await getCurrentAuthSession();
  const user = session.user;

  if (
    requestConfig._authSessionGeneration !== undefined &&
    requestConfig._authSessionUid !== undefined &&
    !isCurrentAuthSession(
      requestConfig._authSessionGeneration,
      requestConfig._authSessionUid,
    )
  ) {
    throw new axios.CanceledError('Authentication session changed.');
  }

  if (user) {
    requestConfig._authSessionGeneration ??= session.generation;
    requestConfig._authSessionUid ??= user.uid;

    try {
      const token = await user.getIdToken();

      if (!isCurrentAuthSession(session.generation, user.uid)) {
        throw new axios.CanceledError('Authentication session changed.');
      }

      const headers = AxiosHeaders.from(config.headers);

      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
    } catch (error) {
      if (isTerminalAuthError(error)) {
        await expireAuthSession(session.generation, user.uid);
      }

      throw error;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const requestConfig = error.config as RetryableRequestConfig | undefined;

    const sessionGeneration = requestConfig?._authSessionGeneration;
    const sessionUid = requestConfig?._authSessionUid;

    if (
      !requestConfig ||
      sessionGeneration === undefined ||
      sessionUid === undefined ||
      !isCurrentAuthSession(sessionGeneration, sessionUid)
    ) {
      return Promise.reject(error);
    }

    if (requestConfig._authRetry) {
      await expireAuthSession(sessionGeneration, sessionUid);
      return Promise.reject(error);
    }

    requestConfig._authRetry = true;

    try {
      const refreshedToken = await refreshCurrentUserToken(
        sessionGeneration,
        sessionUid,
      );

      if (!refreshedToken) {
        return Promise.reject(error);
      }

      const headers = AxiosHeaders.from(requestConfig.headers);
      headers.set('Authorization', `Bearer ${refreshedToken}`);
      requestConfig.headers = headers;

      return api.request(requestConfig);
    } catch (refreshError) {
      if (isTerminalAuthError(refreshError)) {
        await expireAuthSession(sessionGeneration, sessionUid);
      }

      return Promise.reject(refreshError);
    }
  },
);
