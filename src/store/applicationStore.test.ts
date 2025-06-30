import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useApplicationStore } from './applicationStore';
import { useAuthStore } from './authStore';
import { ApplicationService } from '@/lib/api/application/service';

const sample = {
  id: '2',
  name: 'Another',
  code: 'another',
  basePath: '/another',
  url: 'http://another',
  description: '',
  isOnline: true,
  lastChecked: '',
  version: null,
  tags: null,
  owner: null,
};

vi.mock('@/lib/api/application/service', () => ({
  ApplicationService: {
    list: vi.fn().mockResolvedValue({
      data: [
        {
          id: '1',
          name: 'Test',
          code: 'test',
          basePath: '/test',
          url: 'http://test',
          description: '',
          isOnline: false,
          lastChecked: '',
          version: null,
          tags: null,
          owner: null,
        },
      ],
    }),
    create: vi.fn().mockResolvedValue({ data: sample }),
    update: vi.fn().mockResolvedValue({ data: sample }),
    delete: vi.fn().mockResolvedValue({ data: null }),
  },
}));


describe('useApplicationStore', () => {
  beforeEach(() => {
    useApplicationStore.setState({ applications: [], loading: false });
    useAuthStore.setState({ token: 'tok', tenantId: 'tenant1' });
  });

  it('sets applications', () => {
    useApplicationStore.getState().setApplications([sample]);
    expect(useApplicationStore.getState().applications.length).toBe(1);
  });

  it('fetchApplications retrieves data', async () => {
    await useApplicationStore.getState().fetchApplications();
    expect(ApplicationService.list).toHaveBeenCalledWith('tok', 'tenant1');
    expect(useApplicationStore.getState().applications.length).toBe(1);
    expect(useApplicationStore.getState().loading).toBe(false);
  });

  it('setLoading updates loading state', () => {
    useApplicationStore.getState().setLoading(true);
    expect(useApplicationStore.getState().loading).toBe(true);
  });

  it('createApplication posts data and refreshes list', async () => {
    await useApplicationStore.getState().createApplication(sample as any);
    expect(ApplicationService.create).toHaveBeenCalledWith(sample, 'tok', 'tenant1');
    expect(ApplicationService.list).toHaveBeenCalledTimes(2);
  });

  it('updateApplication puts data and refreshes list', async () => {
    await useApplicationStore.getState().updateApplication(sample as any);
    expect(ApplicationService.update).toHaveBeenCalledWith(sample.id, sample, 'tok', 'tenant1');
    expect(ApplicationService.list).toHaveBeenCalledTimes(3);
  });

  it('deleteApplication deletes and refreshes list', async () => {
    await useApplicationStore.getState().deleteApplication('2');
    expect(ApplicationService.delete).toHaveBeenCalledWith('2', 'tok', 'tenant1');
    expect(ApplicationService.list).toHaveBeenCalledTimes(4);
  });
});
