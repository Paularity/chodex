import { describe, it, expect, vi } from 'vitest';
import { responseErrorInterceptor } from './interceptors';
import { useAuthStore } from '@/store/authStore';


describe('responseErrorInterceptor', () => {
  it('logs out on 401 response', async () => {
    const logout = vi.fn();
    useAuthStore.setState({ logout } as any);

    await responseErrorInterceptor({
      response: { status: 401 },
    } as any).catch(() => {});

    expect(logout).toHaveBeenCalled();
  });
});
