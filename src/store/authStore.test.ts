import { describe, it, expect, afterEach } from 'vitest';
import { useAuthStore } from './authStore';

afterEach(() => {
  useAuthStore.setState({
    step: 1,
    username: '',
    otp: '',
    isAuthenticated: false,
    otpExpired: false,
  });
});

describe('useAuthStore', () => {
  it('has default values', () => {
    const state = useAuthStore.getState();
    expect(state.step).toBe(1);
    expect(state.username).toBe('');
    expect(state.otp).toBe('');
    expect(state.isAuthenticated).toBe(false);
    expect(state.otpExpired).toBe(false);
  });

  it('updates username', () => {
    useAuthStore.getState().setUsername('john');
    expect(useAuthStore.getState().username).toBe('john');
  });
});
