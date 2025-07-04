import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useExcelStore } from './excelStore';
import { useAuthStore } from './authStore';
import { ExcelService } from '@/lib/api/excel/service';

const sample = {
  workbookName: 'test.xlsx',
  sheets: [],
};

vi.mock('@/lib/api/excel/service', () => ({
  ExcelService: {
    read: vi.fn().mockResolvedValue({ data: sample }),
  },
}));

describe('useExcelStore', () => {
  beforeEach(() => {
    useExcelStore.setState({ workbook: null, loading: false });
    useAuthStore.setState({ token: 'tok', tenantId: 'tenant1' });
  });

  it('sets workbook', () => {
    useExcelStore.getState().setWorkbook(sample as any);
    expect(useExcelStore.getState().workbook?.workbookName).toBe('test.xlsx');
  });

  it('setLoading updates loading state', () => {
    useExcelStore.getState().setLoading(true);
    expect(useExcelStore.getState().loading).toBe(true);
  });

  it('readExcel posts data and sets workbook', async () => {
    await useExcelStore.getState().readExcel({} as File);
    expect(ExcelService.read).toHaveBeenCalledWith({} as File, 'tok', 'tenant1');
    expect(useExcelStore.getState().workbook?.workbookName).toBe('test.xlsx');
    expect(useExcelStore.getState().loading).toBe(false);
  });
});
