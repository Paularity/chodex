import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';

export function responseErrorInterceptor(error: AxiosError) {
  if (error.response && error.response.status === 401) {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
  return Promise.reject(error);
}

export function setupInterceptors() {
  axios.interceptors.response.use(
    (response) => response,
    responseErrorInterceptor
  );
}

setupInterceptors();
