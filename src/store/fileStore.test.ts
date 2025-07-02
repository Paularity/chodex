import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFileStore } from './fileStore';
import { useAuthStore } from './authStore';
import { FileService } from '@/lib/api/file/service';

const sample = {
  name: 'report.pdf',
  fullPath: '/files/report.pdf',
  fileType: 'pdf',
  stamp: '2025-06-30T07:59:02.586917',
  creator: 'florencio',
  readOnly: true,
  encrypted: false,
  size: 105250,
  tags: 'monthly,report,finance',
  hash: 'abc123hash',
};

vi.mock('@/lib/api/file/service', () => ({
  FileService: {
    list: vi.fn().mockResolvedValue({ data: [{ ...sample, id: '1' }] }),
    create: vi.fn().mockResolvedValue({ data: { ...sample, id: '1' } }),
  },
}));

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
    expect(useFileStore.getState().files.length).toBe(1);
    spy.mockRestore();
    expect(useFileStore.getState().loading).toBe(false);
  });

  it('setLoading updates loading state', () => {
    useFileStore.getState().setLoading(true);
    expect(useFileStore.getState().loading).toBe(true);
  });

  it('createFile posts data and refreshes list', async () => {
    await useFileStore.getState().createFile(sample as any);
    expect(FileService.create).toHaveBeenCalledWith(sample, 'tok', 'tenant1');
    expect(FileService.list).toHaveBeenCalledTimes(2);
  });
});

