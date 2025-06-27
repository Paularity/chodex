import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useApplicationStore } from './applicationStore';
import { ApplicationService } from '@/lib/api/application/service';

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
  },
}));

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

describe('useApplicationStore', () => {
  beforeEach(() => {
    useApplicationStore.setState({ applications: [], loading: false });
  });

  it('sets applications', () => {
    useApplicationStore.getState().setApplications([sample]);
    expect(useApplicationStore.getState().applications.length).toBe(1);
  });

  it('fetchApplications retrieves data', async () => {
    await useApplicationStore.getState().fetchApplications();
    expect(useApplicationStore.getState().applications.length).toBe(1);
    expect(useApplicationStore.getState().loading).toBe(false);
  });
});
