/* eslint-disable @typescript-eslint/no-explicit-any */
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from '@/components/ui/menubar';
import { useExcelStore } from '@/store/excelStore';
import { Pencil, CheckCircle, Edit3, XCircle, Trash2, Settings2, List, KeyRound, Columns3, Type } from 'lucide-react';
import { toast } from 'sonner';

export function ExcelToolbar({ indexColumnSheets, setIndexColumnSheets, onLoading, keyColumnSheets, setKeyColumnSheets }: {
    indexColumnSheets: string[];
    setIndexColumnSheets: (sheets: string[]) => void;
    keyColumnSheets: string[];
    setKeyColumnSheets: (sheets: string[]) => void;
    onLoading?: (fn: () => void, message?: string) => void;
    onOpenChangeMultipleTypes?: () => void;
}) {
    const { editMode, setEditMode, workbook, activeSheet } = useExcelStore();
    const hasData = workbook && workbook.sheets && workbook.sheets.length > 0;

    // Handler for removing empty rows and re-indexing
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
            // Re-index the __rowIndex for the active sheet after removal
            const reindexedRows = filteredRows.map((row, idx) => {
                if (indexColumnSheets.includes(activeSheet || '')) {
                    (row as any)['__rowIndex'] = idx + 1;
                } else {
                    delete (row as any)['__rowIndex'];
                }
                return row;
            });
            if (filteredRows.length === sheet.rows.length) {
                toast.info('No empty rows to remove.');
            } else {
                toast.success(`${sheet.rows.length - filteredRows.length} empty row(s) removed.`);
            }
            return {
                ...sheet,
                rows: reindexedRows,
            };
        });
        useExcelStore.getState().setWorkbook({ ...workbook, sheets: updatedSheets });
    };

    // Handler to toggle index column for the active sheet
    const handleToggleIndexColumn = () => {
        if (!workbook || !activeSheet) return;
        const isActive = indexColumnSheets.includes(activeSheet || '');
        let updatedSheets = workbook.sheets;
        if (!isActive) {
            // Add __rowIndex to each row for the active sheet
            updatedSheets = workbook.sheets.map((sheet) => {
                if (sheet.sheetName !== activeSheet) return sheet;
                const indexedRows = sheet.rows.map((row, idx) => {
                    (row as any)['__rowIndex'] = idx + 1;
                    return row;
                });
                return {
                    ...sheet,
                    rows: indexedRows,
                };
            });
            setIndexColumnSheets([...indexColumnSheets, activeSheet]);
            toast.success('Table index column has been created.');
        } else {
            // Remove __rowIndex from each row for the active sheet
            updatedSheets = workbook.sheets.map((sheet) => {
                if (sheet.sheetName !== activeSheet) return sheet;
                const cleanedRows = sheet.rows.map((row) => {
                    delete (row as any)['__rowIndex'];
                    return row;
                });
                return {
                    ...sheet,
                    rows: cleanedRows,
                };
            });
            setIndexColumnSheets(indexColumnSheets.filter((s) => s !== activeSheet));
            toast.info('Table index column has been removed.');
        }
        useExcelStore.getState().setWorkbook({ ...workbook, sheets: updatedSheets });
    };

    // Helper to generate GUID
    const generateGUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    // Handler to toggle key column for the active sheet
    const handleToggleKeyColumn = () => {
        if (!workbook || !activeSheet || !setKeyColumnSheets) return;
        const isActive = keyColumnSheets.includes(activeSheet || '');
        let updatedSheets = workbook.sheets;
        if (!isActive) {
            // Add Key column to columns and GUID to each row for the active sheet, only if not present
            updatedSheets = workbook.sheets.map((sheet) => {
                if (sheet.sheetName !== activeSheet) return sheet;
                // Only add if not already present
                const keyColIdx = sheet.columns.findIndex(col => col.name === 'Key');
                let newColumns = sheet.columns;
                let keyedRows = sheet.rows;
                if (keyColIdx === -1) {
                    newColumns = [
                        { name: 'Key', dataType: 'string', format: '', formula: '' },
                        ...sheet.columns,
                    ];
                    // If there are no rows, create a single row with a GUID
                    if (sheet.rows.length === 0) {
                        keyedRows = [[String(generateGUID())]];
                    } else {
                        keyedRows = sheet.rows.map((row) => [String(generateGUID()), ...row]);
                    }
                }
                return {
                    ...sheet,
                    columns: newColumns,
                    rows: keyedRows,
                };
            });
            setKeyColumnSheets([...keyColumnSheets, activeSheet]);
            toast.success('Table key column has been created.');
        } else {
            // Remove Key column from columns and value from each row for the active sheet (by name, not just first col)
            updatedSheets = workbook.sheets.map((sheet) => {
                if (sheet.sheetName !== activeSheet) return sheet;
                const keyColIdx = sheet.columns.findIndex(col => col.name === 'Key');
                if (keyColIdx === -1) return sheet; // nothing to remove
                const newColumns = sheet.columns.filter((_, idx) => idx !== keyColIdx);
                const cleanedRows = sheet.rows.map((row) => row.filter((_, idx) => idx !== keyColIdx));
                return {
                    ...sheet,
                    columns: newColumns,
                    rows: cleanedRows,
                };
            });
            setKeyColumnSheets(keyColumnSheets.filter((s) => s !== activeSheet));
            toast.info('Table key column has been removed.');
        }
        useExcelStore.getState().setWorkbook({ ...workbook, sheets: updatedSheets });
    };

    // Wrap actions with loading if onLoading is provided
    const handleRemoveRowsWithLoading = () => {
        if (onLoading) onLoading(handleRemoveRows, 'Removing empty rows...');
        else handleRemoveRows();
    };
    const handleToggleIndexColumnWithLoading = () => {
        if (onLoading) onLoading(handleToggleIndexColumn, indexColumnSheets.includes(activeSheet || '') ? 'Removing table index...' : 'Creating table index...');
        else handleToggleIndexColumn();
    };
    const handleToggleKeyColumnWithLoading = () => {
        if (onLoading) onLoading(handleToggleKeyColumn, keyColumnSheets.includes(activeSheet || '') ? 'Removing table keys...' : 'Creating table keys...');
        else handleToggleKeyColumn();
    };

    // Handler to open Change Multiple Types dialog, always providing columns (even if empty)
    const handleOpenChangeMultipleTypes = () => {
        if (!workbook || !activeSheet) return;
        const sheet = workbook.sheets.find(s => s.sheetName === activeSheet);
        if (!sheet) return;
        // If columns is empty, generate default columns from first row
        let columns = sheet.columns;
        if ((!columns || columns.length === 0) && sheet.rows && sheet.rows.length > 0) {
            columns = sheet.rows[0].map((_, idx) => ({ name: `Column${idx + 1}`, dataType: 'string', format: '', formula: '' }));
        }
        // If still empty, create a single default column
        if (!columns || columns.length === 0) {
            columns = [{ name: 'Column1', dataType: 'string', format: '', formula: '' }];
        }
        // Store columns and rows in a global store for the dialog to use
        useExcelStore.getState().setMultiTypeDialog({ open: true, sheetName: activeSheet, columns });
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
                        {/* Remove Empty Rows action using MenubarItem */}
                        <MenubarItem
                            onClick={handleRemoveRowsWithLoading}
                            className="flex items-center gap-2 font-semibold"
                            disabled={!editMode}
                        >
                            <Trash2 className="w-4 h-4 text-red-600" />
                            Remove Empty Rows
                        </MenubarItem>
                        {/* Toggle Table Index action using MenubarItem */}
                        <MenubarItem
                            onClick={handleToggleIndexColumnWithLoading}
                            className="flex items-center gap-2 font-semibold"
                            disabled={!editMode}
                        >
                            <List className="w-4 h-4 text-blue-600" />
                            {indexColumnSheets.includes(activeSheet || '') ? 'Remove Table Index' : 'Create Table Index'}
                        </MenubarItem>
                        {/* Toggle Table Key action using MenubarItem */}
                        <MenubarItem
                            onClick={handleToggleKeyColumnWithLoading}
                            className="flex items-center gap-2 font-semibold"
                            disabled={!editMode}
                        >
                            <KeyRound className="w-4 h-4 text-yellow-600" />
                            {keyColumnSheets.includes(activeSheet || '') ? 'Remove Table Keys' : 'Create Table Keys'}
                        </MenubarItem>
                        {/* Delete Multiple Columns action */}
                        <MenubarItem
                            onClick={() => {
                                if (!workbook || !activeSheet) return;
                                useExcelStore.getState().setDeleteColsDialog({ open: true, sheetName: activeSheet, selected: [] });
                            }}
                            className="flex items-center gap-2 font-semibold"
                            disabled={!editMode}
                        >
                            <Columns3 className="w-4 h-4 text-purple-600" />
                            Delete Multiple Columns
                        </MenubarItem>
                        {/* Change Multiple Columns Types action */}
                        <MenubarItem
                            onClick={() => {
                                if (onLoading) {
                                    onLoading(handleOpenChangeMultipleTypes, 'Fetching data types of columns...');
                                } else {
                                    handleOpenChangeMultipleTypes();
                                }
                            }}
                            className="flex items-center gap-2 font-semibold"
                            disabled={!editMode}
                        >
                            <Type className="w-4 h-4 text-green-600" />
                            Change Multiple Columns Types
                        </MenubarItem>
                        {/* ...other menu items can go here... */}
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
