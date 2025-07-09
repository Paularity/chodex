import { Dialog } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useExcelStore } from '@/store/excelStore';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export function DeleteMultipleColumnsDialog() {
    const { workbook, deleteColsDialog, setDeleteColsDialog } = useExcelStore();
    const [loading, setLoading] = useState(false);

    const handleChange = (idx: number, checked: boolean) => {
        const selected = checked
            ? [...deleteColsDialog.selected, idx]
            : deleteColsDialog.selected.filter(i => i !== idx);
        setDeleteColsDialog({ ...deleteColsDialog, selected });
    };

    const handleCancel = () => {
        if (loading) return;
        setDeleteColsDialog({ open: false, sheetName: '', selected: [] });
    };

    const handleDelete = async () => {
        if (!workbook || !deleteColsDialog.open) return;
        setLoading(true);
        // Simulate async operation for UX (e.g., 1s delay)
        await new Promise(res => setTimeout(res, 1000));
        const { sheetName, selected } = deleteColsDialog;
        const updatedSheets = workbook.sheets.map(sheet => {
            if (sheet.sheetName !== sheetName) return sheet;
            // Sort indices descending to avoid shifting
            const sorted = [...selected].sort((a, b) => b - a);
            let newColumns = [...sheet.columns];
            let newRows = sheet.rows.map(row => [...row]);
            for (const colIdx of sorted) {
                newColumns = newColumns.filter((_, i) => i !== colIdx);
                newRows = newRows.map(row => row.filter((_, i) => i !== colIdx));
            }
            return { ...sheet, columns: newColumns, rows: newRows };
        });
        useExcelStore.getState().setWorkbook({ ...workbook, sheets: updatedSheets });
        setDeleteColsDialog({ open: false, sheetName: '', selected: [] });
        setLoading(false);
    };

    return (
        <Dialog open={deleteColsDialog.open} onOpenChange={open => setDeleteColsDialog(open ? deleteColsDialog : { open: false, sheetName: '', selected: [] })}>
            {deleteColsDialog.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-0 min-w-[340px] max-w-md w-full border border-gray-200 animate-fade-in-up relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20 rounded-2xl animate-fade-in">
                                <Trash2 className="w-8 h-8 text-red-600 animate-bounce mb-2" />
                                <span className="text-black font-semibold text-base">Deleting columns...</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 px-6 py-4 rounded-t-2xl bg-black border-b border-gray-100">
                            <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-2">
                                <Trash2 className="w-6 h-6 text-white" />
                            </span>
                            <span className="font-bold text-lg tracking-wide text-white">Delete Multiple Columns</span>
                        </div>
                        <div className="px-6 pt-4 pb-2">
                            <div className="mb-2 text-sm text-gray-900 font-medium">
                                <span className="text-black font-semibold">Warning:</span> This action will <span className="font-bold">permanently remove</span> the selected columns from <span className="font-bold text-black">{deleteColsDialog.sheetName}</span>.
                            </div>
                            <div className="mb-4 text-xs text-gray-500">Select columns to delete. This cannot be undone.</div>
                            <div className="max-h-48 overflow-y-auto mb-4 space-y-1 pr-1">
                                {workbook?.sheets.find(s => s.sheetName === deleteColsDialog.sheetName)?.columns.map((col, idx) => (
                                    <label
                                        key={idx}
                                        className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition hover:bg-gray-100 focus-within:bg-gray-200 ${deleteColsDialog.selected.includes(idx) ? 'bg-gray-100' : ''}`}
                                    >
                                        <Checkbox
                                            checked={deleteColsDialog.selected.includes(idx)}
                                            onCheckedChange={checked => handleChange(idx, !!checked)}
                                            id={`delete-col-checkbox-${idx}`}
                                            disabled={loading}
                                        />
                                        <span className="text-sm font-medium text-gray-900">{col.name}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex gap-2 justify-end mt-6">
                                <Button
                                    variant="secondary"
                                    onClick={handleCancel}
                                    type="button"
                                    className="rounded-full px-5 py-2 font-semibold shadow-sm bg-black text-white hover:bg-gray-900 transition"
                                    disabled={loading}
                                >Cancel</Button>
                                <Button
                                    variant="default"
                                    disabled={deleteColsDialog.selected.length === 0 || loading}
                                    onClick={handleDelete}
                                    type="button"
                                    className="rounded-full px-5 py-2 font-semibold shadow-lg bg-white text-black border border-gray-300 hover:bg-gray-100 transition flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Dialog>
    );
}
