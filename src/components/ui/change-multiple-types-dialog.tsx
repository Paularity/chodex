import React, { useState } from 'react';
import { Dialog } from './dialog';
import { Button } from './button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './select';
import { convertCellForTypeChange } from '../pages/ExcelReader/helpers';
import type { ExcelColumn } from '@/lib/api/models/excel-workbook.model';
import { Type } from 'lucide-react';

interface ChangeMultipleTypesDialogProps {
    open: boolean;
    columns: ExcelColumn[];
    onClose: () => void;
    onConfirm: (changes: { colIdx: number; newType: string }[], cleanedRows?: (string | number | null)[][]) => void;
    // Optionally, pass in sampleRows for type inference
    sampleRows?: (string | number | null)[][];
}

function inferTypeFromValues(values: (string | number | null)[]): string {
    // Remove null/undefined/empty
    const filtered = values.filter(v => v !== null && v !== undefined && v !== '');
    if (filtered.length === 0) return 'string';
    // Check for number
    if (filtered.every(v => !isNaN(Number(v)))) return 'number';
    // Check for boolean
    if (filtered.every(v => v === 'true' || v === 'false' || v === 1 || v === 0 || v === '1' || v === '0')) return 'boolean';
    // Check for date (YYYY-MM-DD)
    if (filtered.every(v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v))) return 'date';
    // Check for datetime (ISO)
    if (filtered.every(v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v))) return 'datetime';
    // Check for time (HH:MM or HH:MM:SS)
    if (filtered.every(v => typeof v === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(v))) return 'time';
    return 'string';
}

export function ChangeMultipleTypesDialog({ open, columns, onClose, onConfirm, sampleRows }: ChangeMultipleTypesDialogProps) {
    const [selected, setSelected] = useState<{ [colIdx: number]: string }>({});

    // Compute default types for each column
    const defaultTypes = columns.map((col, idx) => {
        if (sampleRows && sampleRows.length > 0) {
            const colValues = sampleRows.map(row => row[idx]);
            return inferTypeFromValues(colValues);
        }
        return col.dataType || 'string';
    });

    const handleTypeChange = (colIdx: number, newType: string) => {
        setSelected(prev => ({ ...prev, [colIdx]: newType }));
    };

    const handleConfirm = () => {
        const changes = Object.entries(selected)
            .filter(([, type]) => type && type !== '')
            .map(([colIdx, newType]) => ({ colIdx: Number(colIdx), newType }));
        if (sampleRows && changes.length > 0) {
            const cleanedRows = sampleRows.map(row => {
                const newRow = [...row];
                changes.forEach(({ colIdx, newType }) => {
                    const val = row[colIdx];
                    // Use the exact same logic as the header context menu's type change
                    newRow[colIdx] = convertCellForTypeChange(val, newType);
                });
                return newRow;
            });
            onConfirm(changes, cleanedRows);
        } else {
            onConfirm(changes);
        }
        setSelected({});
    };

    const handleClose = () => {
        setSelected({});
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-0 min-w-[340px] w-full max-w-2xl border border-gray-200 animate-fade-in-up relative flex flex-col h-[70vh] max-h-[90vh]"
                    >
                        <div className="flex items-center gap-3 px-6 py-4 rounded-t-2xl bg-black border-b border-gray-100">
                            <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-2">
                                <Type className="w-6 h-6 text-white" />
                            </span>
                            <span className="font-bold text-lg tracking-wide text-white">Change Multiple Columns Data Types</span>
                        </div>
                        <div className="px-6 pt-4 pb-2 flex flex-col flex-1 min-h-0">
                            <div className="mb-2 text-sm text-gray-900 font-medium">
                                <span className="text-black font-semibold">Info:</span> This will change the data type of the selected columns. Incompatible values will be <span className="font-bold">cleared</span> automatically.
                            </div>
                            <div className="mb-4 text-xs text-gray-500">Select the new data type for each column you want to change.</div>
                            <div className="flex-1 min-h-0 max-h-full overflow-y-auto mb-4 pr-1">
                                {/* Header Row */}
                                <div
                                    className="grid grid-cols-[180px_60px_140px_120px] gap-x-2 px-2 py-1 font-semibold text-xs text-gray-600 border-b border-gray-200 sticky top-0 bg-white z-10 min-w-0"
                                >
                                    <span className="truncate">Column Name</span>
                                    <span className="truncate">Current</span>
                                    <span className="truncate">New Type</span>
                                    <span className="truncate">Default</span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {columns.map((col, idx) => (
                                        <div
                                            key={idx}
                                            className={
                                                `grid grid-cols-[180px_60px_140px_120px] gap-x-2 px-2 py-1 items-center` +
                                                ' hover:bg-gray-100 focus-within:bg-gray-200 transition'
                                            }
                                        >
                                            <span className="text-sm font-medium text-gray-900 truncate" title={col.name}>{col.name}</span>
                                            <span className="text-xs text-muted-foreground">({col.dataType})</span>
                                            <Select
                                                value={selected[idx] ?? defaultTypes[idx]}
                                                onValueChange={val => handleTypeChange(idx, val)}
                                            >
                                                <SelectTrigger className="w-32 h-8 text-xs">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="string">String</SelectItem>
                                                    <SelectItem value="number">Number</SelectItem>
                                                    <SelectItem value="boolean">Boolean</SelectItem>
                                                    <SelectItem value="date">Date</SelectItem>
                                                    <SelectItem value="datetime">Datetime</SelectItem>
                                                    <SelectItem value="time">Time</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <span className="text-xs text-gray-400 ml-2">Default: {defaultTypes[idx]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end mt-6">
                                <Button
                                    variant="secondary"
                                    onClick={handleClose}
                                    type="button"
                                    className="rounded-full px-5 py-2 font-semibold shadow-sm bg-black text-white hover:bg-gray-900 transition"
                                >Cancel</Button>
                                <Button
                                    variant="default"
                                    disabled={Object.keys(selected).length === 0}
                                    onClick={handleConfirm}
                                    type="button"
                                    className="rounded-full px-5 py-2 font-semibold shadow-lg bg-white text-black border border-gray-300 hover:bg-gray-100 transition"
                                >
                                    Apply
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Dialog>
    );
}
