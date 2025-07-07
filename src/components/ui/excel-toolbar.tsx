import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from '@/components/ui/menubar';
import { useExcelStore } from '@/store/excelStore';
import { Pencil, CheckCircle, Edit3, XCircle, Trash2, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

export function ExcelToolbar() {
    const { editMode, setEditMode, workbook, activeSheet } = useExcelStore();
    const hasData = workbook && workbook.sheets && workbook.sheets.length > 0;

    // Handler for removing empty rows
    const handleRemoveRows = () => {
        if (!workbook || !activeSheet) return;
        const updatedSheets = workbook.sheets.map((sheet) => {
            if (sheet.sheetName !== activeSheet) return sheet;
            // Remove rows where ALL cells are empty/null/undefined/whitespace
            const filteredRows = sheet.rows.filter(row => {
                // If every cell is empty/null/undefined/whitespace, remove the row
                return row.some(cell => {
                    if (cell === undefined || cell === null) return false;
                    if (typeof cell === 'string' && cell.trim() !== '') return true;
                    if (typeof cell === 'number' && !isNaN(cell)) return true;
                    return false;
                });
            });
            if (filteredRows.length === sheet.rows.length) {
                toast.info('No empty rows to remove.');
            } else {
                toast.success(`${sheet.rows.length - filteredRows.length} empty row(s) removed.`);
            }
            return {
                ...sheet,
                rows: filteredRows,
            };
        });
        useExcelStore.getState().setWorkbook({ ...workbook, sheets: updatedSheets });
    };

    return (
        <Menubar className="mb-4 rounded-lg border shadow-sm bg-white flex justify-between items-center px-2 py-1">
            <div className="flex items-center gap-2">
                {/* Edit Mode Menu */}
                <MenubarMenu>
                    <MenubarTrigger
                        className={`text-xs px-3 py-1 ml-2 flex items-center gap-2 font-bold transition ${editMode ? 'text-green-700 bg-green-100 border-green-300' : 'text-blue-700 bg-blue-100 border-blue-300 hover:bg-blue-200'}`}
                        disabled={!hasData}
                        style={!hasData ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                    >
                        {editMode ? <CheckCircle size={18} className="text-green-600" /> : <Edit3 size={18} className="text-blue-600" />}
                        {editMode ? 'Edit Mode' : 'Edit Table'}
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem
                            onClick={() => hasData && setEditMode(!editMode)}
                            className="flex items-center gap-2 font-semibold"
                            disabled={!hasData}
                        >
                            {editMode ? <XCircle size={16} className="text-red-600" /> : <Pencil size={16} className="text-blue-600" />}
                            {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                {/* Data Actions Menu */}
                <MenubarMenu>
                    <MenubarTrigger
                        className="text-xs px-3 py-1 flex items-center gap-2 font-bold hover:bg-gray-100"
                        disabled={!editMode}
                        style={!editMode ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                    >
                        <Settings2 className="w-4 h-4" />
                        Data Actions
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem
                            onClick={handleRemoveRows}
                            className="flex items-center gap-2 font-semibold"
                            disabled={!editMode}
                        >
                            <Trash2 className="w-4 h-4 text-red-600" />
                            Remove Empty Rows
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </div>
            <div className="flex-1 flex justify-end">
                {editMode && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold border border-green-300 animate-fade-in">
                        <CheckCircle size={14} className="mr-1 text-green-600" /> Edit Mode is Active
                    </span>
                )}
            </div>
        </Menubar>
    );
}

// Custom Tabulator boolean editor using shadcn Checkbox
export function shadcnBooleanEditor(cell, onRendered, success, cancel) {
    // Create a container div
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    // Create a React root for the Checkbox
    const root = window.ReactDOM.createRoot(container);
    const initial = cell.getValue() === true || cell.getValue() === 'true' || cell.getValue() === 1;
    root.render(
        <Checkbox
            checked={initial}
            onCheckedChange={val => {
                success(!!val);
            }}
            className="mx-auto"
            tabIndex={0}
            autoFocus
        />
    );
    onRendered(() => {
        // Focus the checkbox
        const input = container.querySelector('input[type="checkbox"]');
        if (input) input.focus();
    });
    return container;
}
