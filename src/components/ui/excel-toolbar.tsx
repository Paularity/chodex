/* eslint-disable @typescript-eslint/no-explicit-any */
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from '@/components/ui/menubar';
import { useExcelStore } from '@/store/excelStore';
import { Pencil, CheckCircle, Edit3, XCircle, Trash2, Settings2, List, KeyRound, Columns3, Type, Download, Save, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useEffect, useState } from 'react';

// Types
interface Sheet {
    sheetName: string;
    columns: { name: string }[];
    rows: (string | number | null | undefined)[][];
}
interface Workbook {
    sheets: Sheet[];
}
interface ColumnFilter {
    sheet: string;
    colIdx: number;
    value: string;
    operator: string;
}

export function ExcelToolbar({
    indexColumnSheets,
    setIndexColumnSheets,
    onLoading,
    keyColumnSheets,
    setKeyColumnSheets,
    columnFilters = [],
    exportCurrentSheetWithVisibleData,
    onReupload,
}: {
    indexColumnSheets: string[];
    setIndexColumnSheets: (sheets: string[]) => void;
    keyColumnSheets: string[];
    setKeyColumnSheets: (sheets: string[]) => void;
    onLoading?: (fn: () => void, message?: string) => void;
    onOpenChangeMultipleTypes?: () => void;
    columnFilters?: ColumnFilter[];
    exportCurrentSheetWithVisibleData?: () => void;
    onReupload?: () => void;
}) {
    const { editMode, setEditMode, workbook, activeSheet } = useExcelStore();
    const hasData = workbook && workbook.sheets && workbook.sheets.length > 0;
    // Workbook name edit state
    const [editingWorkbookName, setEditingWorkbookName] = useState(false);
    const [workbookNameInput, setWorkbookNameInput] = useState<string>(workbook?.workbookName || 'workbook.xlsx');

    useEffect(() => {
        setWorkbookNameInput(workbook?.workbookName || 'workbook.xlsx');
        setEditingWorkbookName(false); // Reset to read mode on workbook change
    }, [workbook?.workbookName]);

    const handleRenameWorkbook = () => {
        if (!workbook) return;
        useExcelStore.getState().setWorkbook({ ...workbook, workbookName: workbookNameInput.trim() || 'workbook.xlsx' });
        setEditingWorkbookName(false);
    };

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

    // Helper to apply filters to a sheet's rows
    const filterSheetRows = (sheet: Sheet, filters: ColumnFilter[]): (string | number | null | undefined)[][] => {
        if (!filters || filters.length === 0) return sheet.rows;
        // Only apply filters for this sheet
        const activeFilters = filters.filter((f: ColumnFilter) => f.sheet === sheet.sheetName && (f.value !== '' || f.operator === 'isEmpty' || f.operator === 'isNotEmpty'));
        if (activeFilters.length === 0) return sheet.rows;
        return sheet.rows.filter((row: (string | number | null | undefined)[]) => {
            return activeFilters.every((f: ColumnFilter) => {
                const cell = row[f.colIdx];
                switch (f.operator) {
                    case 'equals': return String(cell ?? '') === f.value;
                    case 'notEquals': return String(cell ?? '') !== f.value;
                    case 'contains': return String(cell ?? '').toLowerCase().includes(f.value.toLowerCase());
                    case 'notContains': return !String(cell ?? '').toLowerCase().includes(f.value.toLowerCase());
                    case 'startsWith': return String(cell ?? '').startsWith(f.value);
                    case 'endsWith': return String(cell ?? '').endsWith(f.value);
                    case 'gt': return Number(cell) > Number(f.value);
                    case 'gte': return Number(cell) >= Number(f.value);
                    case 'lt': return Number(cell) < Number(f.value);
                    case 'lte': return Number(cell) <= Number(f.value);
                    case 'isEmpty': return cell === undefined || cell === null || cell === '';
                    case 'isNotEmpty': return cell !== undefined && cell !== null && cell !== '';
                    default: return true;
                }
            });
        });
    };

    // Export all sheets (filtered) as a real Excel file (XLSX)
    const exportWorkbookToExcel = (workbook: Workbook, filters: ColumnFilter[]) => {
        if (!workbook) return;
        const wb = XLSX.utils.book_new();
        for (const sheet of workbook.sheets) {
            const sheetFilters = filters.filter(f => f.sheet === sheet.sheetName);
            // Prepare data: header row + filtered rows
            const aoa: (string | number | null | undefined)[][] = [];
            aoa.push(sheet.columns.map(col => col.name));
            const filteredRows = filterSheetRows(sheet, sheetFilters);
            for (const row of filteredRows) {
                aoa.push(row);
            }
            const ws = XLSX.utils.aoa_to_sheet(aoa);
            XLSX.utils.book_append_sheet(wb, ws, sheet.sheetName || 'Sheet');
        }
        XLSX.writeFile(wb, 'workbook.xlsx');
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

    // Helper to strip file extension from workbook name
    const getWorkbookNameWithoutExtension = (name: string) => {
        return name.replace(/\.[^/.]+$/, '');
    };

    const workbookId = useExcelStore.getState().workbookId;

    return (
        <Menubar className="mb-4 rounded-lg border shadow-sm bg-white flex justify-between items-center px-2 py-1">
            <div className="flex items-center gap-2">
                {/* Workbook Name Display & Rename (shadcn/tailwind) */}
                <div className="flex items-center gap-2 mr-4">
                    {editMode ? (
                        editingWorkbookName ? (
                            <>
                                <input
                                    type="text"
                                    value={getWorkbookNameWithoutExtension(workbookNameInput)}
                                    onChange={e => setWorkbookNameInput(
                                        e.target.value.replace(/\.[^/.]+$/, '') + ((workbook?.workbookName && workbook?.workbookName.includes('.')) ? workbook?.workbookName.slice(workbook?.workbookName.lastIndexOf('.')) : '.xlsx')
                                    )}
                                    className="shadcn-input text-xs font-bold px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
                                    placeholder="Workbook name"
                                    title="Workbook name"
                                    autoFocus
                                    onKeyDown={e => { if (e.key === 'Enter') handleRenameWorkbook(); if (e.key === 'Escape') setEditingWorkbookName(false); }}
                                />
                                <button
                                    type="button"
                                    onClick={handleRenameWorkbook}
                                    className="shadcn-button ml-1 flex items-center gap-1 px-2 py-1 text-xs font-bold rounded border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                                    disabled={workbookNameInput.trim() === (workbook?.workbookName || 'workbook.xlsx')}
                                >
                                    <Save className="w-3 h-3 text-blue-600" />
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingWorkbookName(false)}
                                    className="shadcn-button ml-1 flex items-center gap-1 px-2 py-1 text-xs font-bold rounded border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition"
                                >
                                    <XCircle className="w-3 h-3 text-gray-600" />
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="text-xs font-bold px-2 py-1 text-gray-700" title={workbook?.workbookName || 'workbook.xlsx'}>
                                    {getWorkbookNameWithoutExtension(workbook?.workbookName || 'workbook.xlsx')}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setEditingWorkbookName(true)}
                                    className="shadcn-button p-1 rounded hover:bg-gray-100 transition border border-transparent"
                                    aria-label="Edit workbook name"
                                >
                                    <Pencil className="w-4 h-4 text-blue-600" />
                                </button>
                            </>
                        )
                    ) : (
                        <span className="text-xs font-bold px-2 py-1 text-gray-700" title={workbook?.workbookName || 'workbook.xlsx'}>
                            {getWorkbookNameWithoutExtension(workbook?.workbookName || 'workbook.xlsx')}
                        </span>
                    )}
                </div>
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
                    </MenubarContent>
                </MenubarMenu>
                {/* Export Menu */}
                <MenubarMenu>
                    <MenubarTrigger
                        className="text-xs px-3 py-1 flex items-center gap-2 font-bold hover:bg-gray-100"
                        disabled={!editMode}
                        style={!editMode ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                    >
                        <Download className="w-4 h-4 text-blue-600" />
                        Export
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem
                            onClick={() => {
                                if (exportCurrentSheetWithVisibleData) {
                                    exportCurrentSheetWithVisibleData();
                                }
                            }}
                            className="flex items-center gap-2 font-semibold"
                            disabled={!editMode}
                        >
                            <Download className="w-4 h-4 text-blue-600" />
                            Export Current Sheet (CSV)
                        </MenubarItem>
                        <MenubarItem
                            onClick={() => {
                                if (!workbook) return;
                                exportWorkbookToExcel(workbook, columnFilters);
                            }}
                            className="flex items-center gap-2 font-semibold"
                            disabled={!editMode}
                        >
                            <Download className="w-4 h-4 text-blue-600" />
                            Export All Sheets (Excel)
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                {/* Re-upload Menu Item */}
                <MenubarMenu>
                    <MenubarTrigger
                        className="text-xs px-3 py-1 flex items-center gap-2 font-bold hover:bg-gray-100"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                        Re-upload
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem
                            onClick={() => {
                                if (onReupload) onReupload();
                            }}
                            className="flex items-center gap-2 font-semibold"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                            Select New File
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </div>
            <div className="flex-1 flex justify-end items-center gap-2">
                {editMode && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold border border-green-300 animate-fade-in">
                        <CheckCircle size={14} className="mr-1 text-green-600" /> Edit Mode is Active
                    </span>
                )}
                {/* Save Button styled like left menu items, right-aligned */}
                <button
                    type="button"
                    className="cursor-pointer text-xs px-3 py-1 flex items-center gap-2 font-bold hover:bg-gray-100 rounded-md border border-transparent transition disabled:opacity-50 disabled:pointer-events-none text-blue-600"
                    disabled={!workbook}
                    onClick={async () => {
                        if (!workbook) return;
                        // Use the workbookId from the store, do not call the service here
                        const id = workbookId;
                        // Log to console with id
                        console.log({
                            id,
                            workbookName: workbook?.workbookName || 'workbook.xlsx',
                            sheets: workbook?.sheets,
                        });
                        toast.success('Workbook saved!');
                        // Place your save logic here (e.g., API call, localStorage, etc.)
                    }}
                >
                    <Save className="w-4 h-4 text-blue-600" />
                    Save
                </button>
            </div>
        </Menubar>
    );
}
