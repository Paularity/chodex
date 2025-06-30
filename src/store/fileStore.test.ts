import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFileStore } from './fileStore';
import { useAuthStore } from './authStore';
import { FileService } from '@/lib/api/file/service';
import type { FileItem } from '@/lib/api/models/file.model';

const sample: FileItem = {
  id: '1',
  name: 'report.pdf',
  fullPath: '/files/report.pdf',
  fileType: 'pdf',
  stamp: '',
  creator: 'tester',
  readOnly: true,
  encrypted: false,
  size: 100,
  tags: null,
  hash: 'hash',
};

vi.mock('@/lib/api/file/service', () => ({
  FileService: {
    list: vi.fn().mockResolvedValue({ data: [sample] }),
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
    await useFileStore.getState().fetchFiles();
    expect(FileService.list).toHaveBeenCalledWith('tok', 'tenant1');
    expect(useFileStore.getState().files.length).toBe(1);
    expect(useFileStore.getState().loading).toBe(false);
  });

  it('setLoading updates loading state', () => {
    useFileStore.getState().setLoading(true);
    expect(useFileStore.getState().loading).toBe(true);
  });
});

