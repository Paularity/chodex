import { describe, it, expect, afterEach } from 'vitest';
import { useAuthStore } from './authStore';

afterEach(() => {
  useAuthStore.setState({
    step: 1,
    username: '',
    tenantId: '11111111-1111-1111-1111-111111111111',
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
    expect(state.tenantId).toBe('11111111-1111-1111-1111-111111111111');
    expect(state.otp).toBe('');
    expect(state.isAuthenticated).toBe(false);
    expect(state.otpExpired).toBe(false);
  });

  it('updates username', () => {
    useAuthStore.getState().setUsername('john');
    expect(useAuthStore.getState().username).toBe('john');
  });

  it('updates tenant id', () => {
    useAuthStore.getState().setTenantId('tenant1');
    expect(useAuthStore.getState().tenantId).toBe('tenant1');
  });
});
