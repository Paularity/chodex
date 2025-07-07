import { useEffect, useRef } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { Switch } from '@/components/ui/switch';
import * as ReactDOM from 'react-dom/client';
import type { ExcelSheet, ExcelColumn } from '@/lib/api/models/excel-workbook.model';

// Custom Tabulator boolean editor using shadcn Switch
function shadcnBooleanEditor(cell: any, onRendered: any, success: any, cancel: any) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    const root = ReactDOM.createRoot(container);
    const initial = cell.getValue() === true || cell.getValue() === 'true' || cell.getValue() === 1;
    root.render(
        <Switch
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
        const input = container.querySelector('button');
        if (input) (input as HTMLButtonElement).focus();
    });
    return container;
}

// Custom Tabulator boolean formatter using shadcn Switch (display only)
function shadcnBooleanFormatter(cell: any) {
    const value = cell.getValue();
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    const root = ReactDOM.createRoot(container);
    root.render(
        <Switch
            checked={value === true || value === 'true' || value === 1}
            disabled={true}
            className="mx-auto opacity-70 pointer-events-none"
            tabIndex={-1}
        />
    );
    return container;
}

interface ExcelTabulatorTableProps {
    sheet: ExcelSheet;
    filtered: boolean;
    editMode: boolean;
    columnDropdowns: Record<string, boolean[]>;
    customDropdownValues: Record<string, string[][]>;
    handleCellEdit: (sheetName: string, rowIdx: number, colIdx: number, value: string | number | null) => void;
    handleDeleteRow: (sheetName: string, rowIdx: number) => void;
    handleUseRowAsHeader: (sheetName: string, rowIdx: number) => void;
    openRenameDialog: (sheetName: string, colIdx: number, currentName: string) => void;
    openDropdownDialog: (sheetName: string, colIdx: number) => void;
    setColumnDropdown: (sheetName: string, colIdx: number, value: boolean) => void;
    paginationSize: number;
    removeBlankRows: (rows: (string | number | null)[][], columns: ExcelColumn[], requiredKeys: string[]) => (string | number | null)[][];
}

export function ExcelTabulatorTable({
    sheet,
    filtered,
    editMode,
    columnDropdowns,
    customDropdownValues,
    handleCellEdit,
    handleDeleteRow,
    handleUseRowAsHeader,
    openRenameDialog,
    openDropdownDialog,
    setColumnDropdown,
    paginationSize,
    removeBlankRows,
}: ExcelTabulatorTableProps) {
    const tableRef = useRef<HTMLDivElement | null>(null);
    const tableInstance = useRef<any>(null);

    useEffect(() => {
        if (!tableRef.current) return;
        if (tableInstance.current && typeof tableInstance.current.destroy === 'function') {
            tableInstance.current.destroy();
        }
        tableRef.current.innerHTML = "";
        setTimeout(() => {
            const columns = [
                ...sheet.columns.map((col: ExcelColumn, colIdx: number) => {
                    const distinctValues = Array.from(new Set(sheet.rows.map((row: (string | number | null)[]) => row[colIdx]).filter((v: string | number | null) => v !== undefined && v !== null && v !== '')));
                    const customValues = customDropdownValues[sheet.sheetName]?.[colIdx] || [];
                    const dropdownValues = Array.from(new Set([...distinctValues, ...customValues]));
                    const isDropdown = columnDropdowns[sheet.sheetName]?.[colIdx] || false;

                    let editor: string | false | ((cell: any, onRendered: any, success: any, cancel: any) => HTMLElement) = false;
                    let formatter: string | ((cell: any) => HTMLElement | string) | undefined = undefined;
                    let validator: ((cellValue: any) => boolean | string) | undefined = undefined;
                    if (col.dataType === "boolean") {
                        formatter = editMode
                            ? (cell: any) => {
                                const value = cell.getValue();
                                const container = document.createElement("div");
                                container.style.display = "flex";
                                container.style.justifyContent = "center";
                                container.style.alignItems = "center";
                                const root = ReactDOM.createRoot(container);
                                root.render(
                                    <Switch
                                        checked={value === true || value === "true" || value === 1}
                                        onCheckedChange={() => { }}
                                        disabled={!editMode}
                                        className="mx-auto"
                                    />
                                );
                                return container;
                            }
                            : shadcnBooleanFormatter;
                    }
                    if (editMode) {
                        switch (col.dataType) {
                            case "number":
                                editor = "number";
                                validator = (val) => {
                                    if (val === null || val === "") return true;
                                    return !isNaN(Number(val)) || "Invalid number";
                                };
                                break;
                            case "boolean":
                                editor = shadcnBooleanEditor;
                                validator = (val) => {
                                    if (val === null || val === "") return true;
                                    return val === true || val === false || val === 1 || val === 0 || val === "true" || val === "false" ? true : "Invalid boolean";
                                };
                                break;
                            case "date":
                                editor = "input";
                                formatter = undefined;
                                validator = (val) => {
                                    if (val === null || val === "") return true;
                                    return /^\d{4}-\d{2}-\d{2}$/.test(val) || "Invalid date (YYYY-MM-DD)";
                                };
                                break;
                            case "datetime":
                                editor = "input";
                                formatter = undefined;
                                validator = (val) => {
                                    if (val === null || val === "") return true;
                                    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/.test(val) || "Invalid datetime (YYYY-MM-DDTHH:MM[:SS])";
                                };
                                break;
                            case "time":
                                editor = "input";
                                formatter = undefined;
                                validator = (val) => {
                                    if (val === null || val === "") return true;
                                    return /^\d{2}:\d{2}(:\d{2})?$/.test(val) || "Invalid time (HH:MM or HH:MM:SS)";
                                };
                                break;
                            default:
                                editor = isDropdown ? "select" : "input";
                                validator = undefined;
                                break;
                        }
                    }

                    return {
                        title: col.name,
                        field: col.name,
                        editor,
                        editable: editMode,
                        editorParams: (() => {
                            if (col.dataType === "date") return { elementAttributes: { type: "date" } };
                            if (col.dataType === "datetime") return { elementAttributes: { type: "datetime-local" } };
                            if (col.dataType === "time") return { elementAttributes: { type: "time" } };
                            return isDropdown ? { values: dropdownValues } : undefined;
                        })(),
                        formatter,
                        validator,
                        cellEdited: function (cell: any) {
                            if (!editMode) return;
                            const rowIdx = cell.getRow().getPosition() - 1;
                            const value = cell.getValue();
                            handleCellEdit(sheet.sheetName, rowIdx, colIdx, value);
                        },
                        headerContextMenu: editMode ? [
                            {
                                label: isDropdown ? "Use Text Input" : "Use Dropdown",
                                action: () => setColumnDropdown(sheet.sheetName, colIdx, !isDropdown),
                                icon: () => isDropdown
                                    ? `<svg xmlns='http://www.w3.org/2000/svg' class='inline-block mr-1' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path d='M4 6h16M4 12h16M4 18h16'/></svg>`
                                    : `<svg xmlns='http://www.w3.org/2000/svg' class='inline-block mr-1' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path d='M19 9l-7 7-7-7'/></svg>`
                            },
                            {
                                label: "Rename Column",
                                action: () => {
                                    openRenameDialog(sheet.sheetName, colIdx, col.name);
                                },
                                icon: () => {
                                    return `<svg xmlns='http://www.w3.org/2000/svg' class='inline-block mr-1' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 20h9'/><path d='M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z'/></svg>`;
                                },
                            },
                            {
                                label: "Manage Dropdown Items",
                                action: () => openDropdownDialog(sheet.sheetName, colIdx),
                                icon: () => `<svg xmlns='http://www.w3.org/2000/svg' class='inline-block mr-1' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor'><circle cx='12' cy='12' r='10'/><path d='M8 12h8M12 8v8'/></svg>`
                            },
                        ] : undefined,
                    };
                }),
            ];
            const dataRows = filtered
                ? removeBlankRows(sheet.rows, sheet.columns, sheet.columns.map((c: ExcelColumn) => c.name))
                : sheet.rows;
            const data = dataRows.map((row: (string | number | null)[], idx: number) => {
                const obj: Record<string, string | number | null> = {};
                sheet.columns.forEach((col: ExcelColumn, i: number) => {
                    obj[col.name] = row[i];
                });
                obj['__rowIdx'] = idx;
                return obj;
            });
            tableInstance.current = new Tabulator(tableRef.current!, {
                data,
                columns,
                layout: "fitDataTable",
                pagination: true,
                paginationMode: "local",
                paginationSize,
                paginationSizeSelector: [10, 15, 25, 50],
                height: 500,
                rowFormatter: () => { },
                rowContextMenu: editMode ? [
                    {
                        label: "Delete Row",
                        action: function (_e: MouseEvent, row: any) {
                            const rowIdx = row.getPosition();
                            handleDeleteRow(sheet.sheetName, rowIdx - 1);
                        },
                        icon: () => {
                            return `<svg xmlns='http://www.w3.org/2000/svg' class='inline-block mr-1' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 18L18 6M6 6l12 12'/></svg>`;
                        },
                    },
                    {
                        label: "Use Row as Header",
                        action: function (_e: MouseEvent, row: any) {
                            const rowIdx = row.getPosition();
                            handleUseRowAsHeader(sheet.sheetName, rowIdx - 1);
                        },
                        icon: () => {
                            return `<svg xmlns='http://www.w3.org/2000/svg' class='inline-block mr-1' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 6h16M4 12h16M4 18h16'/></svg>`;
                        },
                    },
                ] : [],
            });
        }, 0);
        return () => {
            if (tableInstance.current && typeof tableInstance.current.destroy === 'function') {
                tableInstance.current.destroy();
            }
        };
    }, [sheet, filtered, editMode, columnDropdowns, customDropdownValues, paginationSize, removeBlankRows]);

    return <div ref={tableRef} className="w-full max-w-[1200px] mx-auto" />;
}
