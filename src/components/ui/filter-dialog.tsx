import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FilterDialogProps {
    open: boolean;
    sheetName: string;
    colIdx: number;
    value: string;
    operator: string;
    columnName?: string;
    onValueChange: (value: string) => void;
    onOperatorChange: (operator: string) => void;
    onCancel: () => void;
    onApply: () => void;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({
    open,
    //   sheetName,
    //   colIdx,
    value,
    operator,
    columnName,
    onValueChange,
    onOperatorChange,
    onCancel,
    onApply,
}) => {
    return (
        <Dialog open={open} onOpenChange={open ? onCancel : undefined}>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
                    <div className="mb-4 font-semibold">
                        Filter Column: <span className="text-primary">{columnName || ""}</span>
                    </div>
                    <div className="flex gap-2 mb-4 items-center">
                        <label htmlFor="filter-operator" className="sr-only">Operator</label>
                        <select
                            id="filter-operator"
                            className="border px-2 py-1 rounded min-w-[140px]"
                            value={operator}
                            onChange={e => onOperatorChange(e.target.value)}
                            title="Filter operator"
                        >
                            <option value="contains">contains</option>
                            <option value="equals">equals</option>
                            <option value="notEquals">not equals</option>
                            <option value="startsWith">starts with</option>
                            <option value="endsWith">ends with</option>
                            <option value="gt">greater than</option>
                            <option value="gte">greater or equal</option>
                            <option value="lt">less than</option>
                            <option value="lte">less or equal</option>
                            <option value="isEmpty">is empty</option>
                            <option value="isNotEmpty">is not empty</option>
                        </select>
                        <input
                            className="border px-2 py-1 w-full"
                            placeholder="Enter value to filter"
                            value={value}
                            onChange={e => onValueChange(e.target.value)}
                            autoFocus
                            disabled={operator === 'isEmpty' || operator === 'isNotEmpty'}
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                        <Button onClick={onApply}>Apply</Button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};
