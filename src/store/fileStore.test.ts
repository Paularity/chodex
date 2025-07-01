import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFileStore } from './fileStore';
import { useAuthStore } from './authStore';
import { FileService } from '@/lib/api/file/service';
import { mockFiles } from '@/mocks/fileItems';

const sample = mockFiles[0];

describe('useFileStore', () => {
  beforeEach(() => {
    useFileStore.setState({ files: [], loading: false });
    useAuthStore.setState({ token: 'tok', tenantId: 'tenant1' });
  });

  it('sets files', () => {
    useFileStore.getState().setFiles([sample]);
    expect(useFileStore.getState().files.length).toBe(1);
  });

  it('fetchFiles retrieves data', async () => {
    const spy = vi.spyOn(FileService, 'list');
    await useFileStore.getState().fetchFiles();
    expect(spy).toHaveBeenCalledWith('tok', 'tenant1');
    expect(useFileStore.getState().files.length).toBe(mockFiles.length);
    spy.mockRestore();
    expect(useFileStore.getState().loading).toBe(false);
  });

  it('setLoading updates loading state', () => {
    useFileStore.getState().setLoading(true);
    expect(useFileStore.getState().loading).toBe(true);
  });
});

