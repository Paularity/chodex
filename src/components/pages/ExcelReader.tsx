import { useState, useRef, useEffect } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";
import { FileSpreadsheet, Pencil, Type, List, Eraser, XCircle, Replace, ListCollapse, Hash, Check, Calendar, Clock } from 'lucide-react';
import { toast } from "sonner";
import { ExcelToolbar } from '@/components/ui/excel-toolbar';
import { ExcelUploadSection } from '@/components/ui/excel-upload-section';
import { SheetTabs } from '@/components/ui/sheet-tabs';
import { RenameColumnDialog } from '@/components/ui/rename-column-dialog';
import { DropdownManageDialog } from '@/components/ui/dropdown-manage-dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useExcelStore } from '@/store/excelStore';
import type { ExcelSheet, ExcelColumn } from '@/lib/api/models/excel-workbook.model';
import { Switch } from '@/components/ui/switch';
import * as ReactDOM from 'react-dom/client';
import ReactDOMServer from 'react-dom/server';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Custom Tabulator boolean editor using shadcn Switch
function shadcnBooleanEditor(
  cell: { getValue: () => unknown },
  onRendered: () => void,
  success: (value: boolean) => void
): HTMLElement {
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
  onRendered();
  return container;
}

// Custom Tabulator boolean formatter using shadcn Switch (display only)
function shadcnBooleanFormatter(cell: { getValue: () => unknown }): HTMLElement {
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

export default function ExcelReaderPage() {
  const {
    workbook, loading, readExcel,
    activeSheet, setActiveSheet,
    editMode,
    renameDialogOpen, setRenameDialogOpen,
    renameSheet, setRenameSheet,
    renameColIdx, setRenameColIdx,
    renameCurrent, setRenameCurrent,
    renameValue, setRenameValue,
    columnDropdowns, setColumnDropdown,
    customDropdownValues, setCustomDropdownValues,
  } = useExcelStore();
  // Dropdown manage dialog state
  const [dropdownDialogOpen, setDropdownDialogOpen] = useState(false);
  const [dropdownSheet, setDropdownSheet] = useState<string | null>(null);
  const [dropdownColIdx, setDropdownColIdx] = useState<number | null>(null);
  const [dropdownInput, setDropdownInput] = useState('');
  const [paginationSize] = useState(15); // setPaginationSize is unused, so omit
  const tables = useRef<Record<string, object>>({});

  // Picker dialog state for data type change
  const [typeChangeDialog, setTypeChangeDialog] = useState({ open: false, sheetName: '', colIdx: -1, newType: '' });

  // Dialog state for column actions
  const [colActionDialog, setColActionDialog] = useState({ open: false, type: '', sheetName: '', colIdx: -1 });
  const [colActionValue, setColActionValue] = useState('');
  const [colActionFind, setColActionFind] = useState('');
  const [colActionReplace, setColActionReplace] = useState('');

  // Cleanup Tabulator tables on unmount or when workbook changes
  useEffect(() => {
    Object.entries(tables.current).forEach(([key, t]) => {
      try {
        if (t && typeof (t as { destroy?: () => void }).destroy === 'function') {
          (t as { destroy: () => void }).destroy();
        }
      } catch (err) {
        // Ignore errors from double-destroy or invalid instance
        console.warn(`[ExcelReader] Error destroying Tabulator instance for ${key}:`, err);
      }
      // Always remove reference
      delete tables.current[key];
    });
    tables.current = {};
  }, [workbook]);

  // Refactored: handle file read logic for upload section
  const handleFileRead = async (file: File) => {
    try {
      const result = await readExcel(file);
      console.log("[ExcelReader] readExcel result:", result);
      if (!result || !result.sheets || result.sheets.length === 0) {
        toast.error("No valid sheets found in the imported Excel file.");
      } else {
        toast.success("Excel file imported successfully.");
      }
    } catch {
      toast.error("Failed to read Excel file.");
    }
  };

  // Utility: Remove blank rows based on required column keys
  function removeBlankRows(
    rows: (string | number | null)[][],
    columns: ExcelColumn[],
    requiredKeys: string[]
  ): (string | number | null)[][] {
    const keyIndexes = requiredKeys.map(
      (key) => columns.findIndex((col: ExcelColumn) => col.name === key)
    );
    // Only consider a row blank if ALL required keys are blank
    return rows.filter((row: (string | number | null)[]) =>
      keyIndexes.some((idx: number) => {
        const val = row[idx];
        return val !== undefined && val !== null && String(val).trim() !== "";
      })
    );
  }

  // Remove a specific row by index from a sheet
  const handleDeleteRow = (sheetName: string, rowIdx: number) => {
    if (!workbook) return;
    const updatedSheets = workbook.sheets.map((sheet) => {
      if (sheet.sheetName !== sheetName) return sheet;
      return {
        ...sheet,
        rows: sheet.rows.filter((_, idx) => idx !== rowIdx),
      };
    });
    useExcelStore.getState().setWorkbook({ ...workbook, sheets: updatedSheets });
  };

  // Use a specific row as header and remove all rows up to and including it
  const handleUseRowAsHeader = (sheetName: string, rowIdx: number) => {
    if (!workbook) return;
    const updatedSheets = workbook.sheets.map((sheet) => {
      if (sheet.sheetName !== sheetName) return sheet;
      const newHeaderRow = sheet.rows[rowIdx];
      if (!newHeaderRow) return sheet;
      // Build new columns, preserving previous column properties if possible
      const newColumns: ExcelColumn[] = newHeaderRow.map((col, i) => {
        const prevCol = sheet.columns[i];
        return {
          name: String(col ?? `Column${i + 1}`),
          dataType: prevCol?.dataType ?? 'string',
          format: prevCol?.format ?? '',
          formula: prevCol?.formula ?? '',
        };
      });
      const newRows = sheet.rows.slice(rowIdx + 1);
      return {
        ...sheet,
        columns: newColumns,
        rows: newRows,
      };
    });
    useExcelStore.getState().setWorkbook({ ...workbook, sheets: updatedSheets });
  };

  // Handler to open dialog
  const openRenameDialog = (sheetName: string, colIdx: number, currentName: string) => {
    setRenameSheet(sheetName);
    setRenameColIdx(colIdx);
    setRenameCurrent(currentName);
    setRenameValue(currentName);
    setRenameDialogOpen(true);
  };
  // Handler to confirm rename
  const handleRenameConfirm = () => {
    if (renameSheet && renameColIdx !== null && renameValue.trim() && renameValue !== renameCurrent) {
      useExcelStore.getState().renameColumn(renameSheet, renameColIdx, renameValue.trim());
    }
    setRenameDialogOpen(false);
  };

  // Update a cell value in the store
  const handleCellEdit = (sheetName: string, rowIdx: number, colIdx: number, value: string | number | null) => {
    if (!workbook) return;
    const updatedSheets = workbook.sheets.map((sheet) => {
      if (sheet.sheetName !== sheetName) return sheet;
      const newRows = sheet.rows.map((row, idx) =>
        idx === rowIdx ? row.map((cell, cIdx) => (cIdx === colIdx ? value : cell)) : row
      );
      return { ...sheet, rows: newRows };
    });
    useExcelStore.getState().setWorkbook({ ...workbook, sheets: updatedSheets });
  };

  // Callback ref to initialize Tabulator when container is mounted
  const getTableRef = (sheet: ExcelSheet, filtered: boolean) => (el: HTMLDivElement | null) => {
    if (!el || !workbook) return;
    if (tables.current[sheet.sheetName] && typeof (tables.current[sheet.sheetName] as { destroy?: () => void }).destroy === 'function') {
      (tables.current[sheet.sheetName] as { destroy?: () => void }).destroy?.();
    }
    el.innerHTML = "";
    setTimeout(() => {
      const columns = [
        ...sheet.columns.map((col: ExcelColumn, colIdx: number) => {
          // Get distinct values for dropdown
          const distinctValues = Array.from(new Set(sheet.rows.map((row: (string | number | null)[]) => row[colIdx]).filter((v: string | number | null) => v !== undefined && v !== null && v !== '')));
          const customValues = customDropdownValues[sheet.sheetName]?.[colIdx] || [];
          const dropdownValues = Array.from(new Set([...distinctValues, ...customValues]));
          const isDropdown = columnDropdowns[sheet.sheetName]?.[colIdx] || false;

          // Map dataType to Tabulator editor/formatter
          let editor: string | false | ((cell: { getValue: () => unknown }, onRendered: () => void, success: (value: boolean) => void, cancel: () => void) => HTMLElement) = false;
          let formatter: string | ((cell: { getValue: () => unknown }) => HTMLElement | string) | undefined = undefined;
          let validator: ((cellValue: unknown) => boolean | string) | undefined = undefined;
          // Custom boolean formatter: always show Switch, disabled if not editMode
          if (col.dataType === "boolean") {
            formatter = editMode
              ? (cell: { getValue: () => unknown }) => {
                // Use shadcn Switch, disabled if not editMode
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
                validator = (val: unknown) => {
                  if (val === null || val === "") return true;
                  return !isNaN(Number(val)) || "Invalid number";
                };
                break;
              case "boolean":
                editor = shadcnBooleanEditor;
                // formatter already set above
                validator = (val: unknown) => {
                  if (val === null || val === "") return true;
                  return val === true || val === false || val === 1 || val === 0 || val === "true" || val === "false" ? true : "Invalid boolean";
                };
                break;
              case "date":
                editor = "input";
                formatter = undefined;
                validator = (val: unknown) => {
                  if (val === null || val === "") return true;
                  // Accepts YYYY-MM-DD
                  return /^\d{4}-\d{2}-\d{2}$/.test(String(val)) || "Invalid date (YYYY-MM-DD)";
                };
                break;
              case "datetime":
                editor = "input";
                formatter = undefined;
                validator = (val: unknown) => {
                  if (val === null || val === "") return true;
                  // Accepts ISO 8601
                  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/.test(String(val)) || "Invalid datetime (YYYY-MM-DDTHH:MM[:SS])";
                };
                break;
              case "time":
                editor = "input";
                formatter = undefined;
                validator = (val: unknown) => {
                  if (val === null || val === "") return true;
                  // Accepts HH:MM or HH:MM:SS
                  return /^\d{2}:\d{2}(:\d{2})?$/.test(String(val)) || "Invalid time (HH:MM or HH:MM:SS)";
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
            cellEdited: function (cell: unknown) {
              if (!editMode) return;
              // @ts-expect-error Tabulator cell type
              const rowIdx = cell.getRow().getPosition() - 1;
              // @ts-expect-error Tabulator cell type
              const value = cell.getValue();
              // Always coerce value to correct type using convertValue
              const coerced = convertValue(value, col.dataType);
              handleCellEdit(sheet.sheetName, rowIdx, colIdx, coerced);
            },
            headerContextMenu: editMode ? [
              {
                label: menuLabel(ListCollapse, isDropdown ? "Use Text Input" : "Use Dropdown"),
                action: () => setColumnDropdown(sheet.sheetName, colIdx, !isDropdown),
              },
              {
                label: menuLabel(Pencil, "Rename Column"),
                action: () => {
                  openRenameDialog(sheet.sheetName, colIdx, col.name);
                },
              },
              {
                label: menuLabel(Type, "Change Data Type"),
                menu: [
                  ...[
                    { type: "string", icon: Type },
                    { type: "number", icon: Hash },
                    { type: "boolean", icon: Check },
                    { type: "date", icon: Calendar },
                    { type: "datetime", icon: Clock },
                    { type: "time", icon: Clock },
                  ].map(({ type, icon }) => ({
                    label: menuLabel(icon, type.charAt(0).toUpperCase() + type.slice(1)),
                    action: () => {
                      // Helper to test if value is compatible with type
                      const isCompatible = (val: unknown, type: string) => {
                        if (val === null || val === "") return true;
                        switch (type) {
                          case "number":
                            return !isNaN(Number(val));
                          case "boolean":
                            return (
                              val === true || val === false || val === 1 || val === 0 || val === "true" || val === "false"
                            );
                          case "date":
                            return /^\d{4}-\d{2}-\d{2}$/.test(String(val));
                          case "datetime":
                            return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/.test(String(val));
                          case "time":
                            return /^\d{2}:\d{2}(:\d{2})?$/.test(String(val));
                          default:
                            return true;
                        }
                      };
                      // Check for mismatches
                      const mismatches = sheet.rows
                        .map((row, rIdx) => isCompatible(row[colIdx], type) ? null : rIdx)
                        .filter(idx => idx !== null);
                      if (mismatches.length > 0) {
                        setTypeChangeDialog({ open: true, sheetName: sheet.sheetName, colIdx, newType: type });
                      } else {
                        // All values are compatible, convert them
                        const newRows = sheet.rows.map(row => {
                          const newRow = [...row];
                          newRow[colIdx] = convertValue(row[colIdx], type);
                          return newRow;
                        });
                        if (workbook) {
                          useExcelStore.getState().setWorkbook({
                            ...workbook,
                            sheets: workbook.sheets.map(s =>
                              s.sheetName === sheet.sheetName
                                ? {
                                  ...s,
                                  columns: s.columns.map((c, i) => i === colIdx ? { ...c, dataType: type } : c),
                                  rows: newRows as (string | number | null)[][],
                                }
                                : s
                            ),
                          });
                        }
                      }
                    },
                  })),
                ],
              },
              ...(isDropdown ? [{
                label: menuLabel(List, "Manage Dropdown Items"),
                action: () => openDropdownDialog(sheet.sheetName, colIdx),
              }] : []),
              {
                label: menuLabel(Eraser, "Replace Nulls"),
                action: () => openReplaceNullsDialog(sheet.sheetName, colIdx),
              },
              {
                label: menuLabel(XCircle, "Replace Errors"),
                action: () => openReplaceErrorsDialog(sheet.sheetName, colIdx),
              },
              {
                label: menuLabel(Replace, "Find and Replace"),
                action: () => openFindReplaceDialog(sheet.sheetName, colIdx),
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
      // Mount Tabulator directly to el (no extra scroll wrapper)
      const table = new Tabulator(el, {
        data,
        columns,
        layout: "fitDataTable", // auto-fit columns to data
        pagination: true,
        paginationMode: "local",
        paginationSize,
        paginationSizeSelector: [10, 15, 25, 50],
        height: 500,
        rowFormatter: () => { },
        rowContextMenu: editMode ? [
          {
            label: "Delete Row",
            action: function (_e: MouseEvent, row: unknown) {
              // @ts-expect-error Tabulator row type
              const rowIdx = row.getPosition();
              handleDeleteRow(sheet.sheetName, rowIdx - 1);
            },
            icon: () => {
              return `<svg xmlns='http://www.w3.org/2000/svg' class='inline-block mr-1' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 18L18 6M6 6l12 12'/></svg>`;
            },
          },
          {
            label: "Use Row as Header",
            action: function (_e: MouseEvent, row: unknown) {
              // @ts-expect-error Tabulator row type
              const rowIdx = row.getPosition();
              handleUseRowAsHeader(sheet.sheetName, rowIdx - 1);
            },
            icon: () => {
              return `<svg xmlns='http://www.w3.org/2000/svg' class='inline-block mr-1' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 6h16M4 12h16M4 18h16'/></svg>`;
            },
          },
        ] : [],
      });
      tables.current[sheet.sheetName] = table;
    }, 0);
  };

  // Debug: log workbook and sheets
  useEffect(() => {
    if (workbook) {
      console.log("[ExcelReader] workbook:", workbook);
      if (workbook.sheets) {
        console.log("[ExcelReader] sheets:", workbook.sheets);
        workbook.sheets.forEach((sheet, idx) => {
          console.log(`[ExcelReader] Sheet #${idx}:`, sheet.sheetName, sheet.columns, sheet.rows);
        });
      }
    }
  }, [workbook]);

  // Handler to remove dropdown value
  const handleRemoveDropdownValue = (val: string) => {
    if (!dropdownSheet || dropdownColIdx === null) return;
    const values = customDropdownValues[dropdownSheet]?.[dropdownColIdx] || [];
    setCustomDropdownValues(dropdownSheet, dropdownColIdx, values.filter(v => v !== val));
  };

  // Handler to open dropdown manage dialog
  const openDropdownDialog = (sheetName: string, colIdx: number) => {
    setDropdownSheet(sheetName);
    setDropdownColIdx(colIdx);
    setDropdownDialogOpen(true);
    setDropdownInput('');
  };
  // Handler to add value
  const handleAddDropdownValue = () => {
    if (!dropdownSheet || dropdownColIdx === null) return;
    const values = customDropdownValues[dropdownSheet]?.[dropdownColIdx] || [];
    if (dropdownInput.trim() && !values.includes(dropdownInput.trim())) {
      setCustomDropdownValues(dropdownSheet, dropdownColIdx, [...values, dropdownInput.trim()]);
      setDropdownInput('');
    }
  };

  // Helper to convert value to new type (moved to component scope)
  function convertValue(val: unknown, type: string): string | number | null {
    // Handle null/undefined up front
    if (val === null || val === undefined) {
      switch (type) {
        case "number": return val === null ? 0 : NaN;
        case "boolean": return 0;
        case "string": return "";
        case "date": return null;
        case "datetime": return null;
        case "time": return null;
        default: return null;
      }
    }
    // Handle arrays/objects
    if (Array.isArray(val)) {
      switch (type) {
        case "boolean": return 1;
        case "number": return val.length === 0 ? 0 : val.length === 1 ? Number(val[0]) : NaN;
        case "string": return val.toString();
        default: return null;
      }
    }
    if (typeof val === "object" && !(val instanceof Date)) {
      switch (type) {
        case "boolean": return 1;
        case "number": return NaN;
        case "string": return "[object Object]";
        default: return null;
      }
    }
    // Handle Date
    if (val instanceof Date) {
      switch (type) {
        case "number": return val.getTime();
        case "string": return val.toString();
        case "boolean": return 1;
        default: return null;
      }
    }
    // Handle primitives
    switch (type) {
      case "number": {
        if (typeof val === "number") return val;
        if (typeof val === "boolean") return val ? 1 : 0;
        if (typeof val === "string") {
          const n = Number(val);
          if (!isNaN(n)) return n;
          // Try Date fallback
          const d = new Date(val as string);
          return isNaN(d.getTime()) ? NaN : d.getTime();
        }
        return NaN;
      }
      case "boolean": {
        if (typeof val === "boolean") return val ? 1 : 0;
        if (typeof val === "number") return val !== 0 && !isNaN(val) ? 1 : 0;
        if (typeof val === "string") {
          if (val === "") return 0;
          if (val === "false") return 0;
          if (val === "true") return 1;
          return 1; // any non-empty string is true
        }
        return 0;
      }
      case "string": {
        if (typeof val === "string") return val;
        if (typeof val === "number" || typeof val === "boolean" || val === null || val === undefined) return String(val);
        if (val instanceof Date) return val.toString();
        if (Array.isArray(val)) return val.toString();
        if (typeof val === "object") return "[object Object]";
        return String(val);
      }
      case "date": {
        // Define a type for window.luxon.DateTime
        type LuxonDateTime = {
          fromJSDate: (date: Date) => { isValid: boolean; toFormat: (fmt: string) => string; toISO: (opts?: object) => string | null };
        };
        type WindowWithLuxon = typeof window & { luxon?: { DateTime?: LuxonDateTime } };
        const { DateTime } = (window as WindowWithLuxon).luxon || {};
        if (DateTime) {
          const dt = DateTime.fromJSDate(new Date(typeof val === 'string' || typeof val === 'number' || val instanceof Date ? val : ''));
          return dt.isValid ? dt.toFormat("yyyy-MM-dd") : null;
        }
        const d = new Date(typeof val === 'string' || typeof val === 'number' || val instanceof Date ? val : '');
        return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
      }
      case "datetime": {
        type LuxonDateTime = {
          fromJSDate: (date: Date) => { isValid: boolean; toFormat: (fmt: string) => string; toISO: (opts?: object) => string | null };
        };
        type WindowWithLuxon = typeof window & { luxon?: { DateTime?: LuxonDateTime } };
        const { DateTime } = (window as WindowWithLuxon).luxon || {};
        if (DateTime) {
          const dt = DateTime.fromJSDate(new Date(typeof val === 'string' || typeof val === 'number' || val instanceof Date ? val : ''));
          return dt.isValid ? dt.toISO({ suppressMilliseconds: true }) : null;
        }
        const d = new Date(typeof val === 'string' || typeof val === 'number' || val instanceof Date ? val : '');
        return isNaN(d.getTime()) ? null : d.toISOString();
      }
      case "time": {
        type LuxonDateTime = {
          fromJSDate: (date: Date) => { isValid: boolean; toFormat: (fmt: string) => string; toISO: (opts?: object) => string | null };
        };
        type WindowWithLuxon = typeof window & { luxon?: { DateTime?: LuxonDateTime } };
        const { DateTime } = (window as WindowWithLuxon).luxon || {};
        if (DateTime) {
          const dt = DateTime.fromJSDate(new Date(typeof val === 'string' || typeof val === 'number' || val instanceof Date ? val : ''));
          return dt.isValid ? dt.toFormat("HH:mm:ss") : null;
        }
        const d = new Date(typeof val === 'string' || typeof val === 'number' || val instanceof Date ? val : '');
        return isNaN(d.getTime()) ? null : d.toISOString().slice(11, 19);
      }
      default:
        return null;
    }
  }

  // Handler for confirming type change
  const handleConfirmTypeChange = () => {
    const { sheetName, colIdx, newType } = typeChangeDialog;
    if (!workbook || !sheetName || colIdx < 0) return;
    useExcelStore.getState().setWorkbook({
      ...workbook,
      sheets: workbook.sheets.map(s =>
        s.sheetName === sheetName
          ? {
            ...s,
            columns: s.columns.map((c, i) => i === colIdx ? { ...c, dataType: newType } : c),
            rows: s.rows.map(row =>
              row.map((cell, i) => {
                if (i !== colIdx) return cell;
                // Always attempt conversion, set to null if not valid
                const converted = convertValue(cell, newType);
                // For number: null if NaN; for boolean: 1/0; for date/time: string or null
                if (newType === "number" && (converted === null || isNaN(Number(converted)))) return null;
                if (newType === "boolean" && !(converted === 1 || converted === 0)) return null;
                if (newType === "date" && (typeof converted !== 'string' || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(String(converted)))) return null;
                if (newType === "datetime" && (typeof converted !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/.test(String(converted)))) return null;
                if (newType === "time" && (typeof converted !== 'string' || !/^\d{2}:\d{2}(:\d{2})?$/.test(String(converted)))) return null;
                return converted;
              })
            ),
          }
          : s
      ),
    });
    setTypeChangeDialog({ open: false, sheetName: '', colIdx: -1, newType: '' });
  };

  // Handler for canceling type change
  const handleCancelTypeChange = () => {
    setTypeChangeDialog({ open: false, sheetName: '', colIdx: -1, newType: '' });
  };

  // Open dialog helpers
  const openReplaceNullsDialog = (sheetName: string, colIdx: number) => {
    setColActionDialog({ open: true, type: 'replaceNulls', sheetName, colIdx });
    setColActionValue('');
  };
  const openReplaceErrorsDialog = (sheetName: string, colIdx: number) => {
    setColActionDialog({ open: true, type: 'replaceErrors', sheetName, colIdx });
    setColActionValue('');
  };
  const openFindReplaceDialog = (sheetName: string, colIdx: number) => {
    setColActionDialog({ open: true, type: 'findReplace', sheetName, colIdx });
    setColActionFind('');
    setColActionReplace('');
  };

  // Confirm handler
  const handleColActionConfirm = () => {
    if (!workbook || !colActionDialog.open) return;
    const { sheetName, colIdx, type } = colActionDialog;
    const updatedSheets = workbook.sheets.map(sheet => {
      if (sheet.sheetName !== sheetName) return sheet;
      const newRows = sheet.rows.map(row => {
        const cell = row[colIdx];
        if (type === 'replaceNulls') {
          if (cell === null || cell === undefined || (typeof cell === 'string' && cell.trim() === '')) {
            const newRow = [...row];
            newRow[colIdx] = colActionValue as string | number | null;
            return newRow;
          }
        } else if (type === 'replaceErrors') {
          const errorStrings = ["NaN", "#NA", "#N/A", "#VALUE!", "#REF!", "#DIV/0!", "#NAME?", "#NULL!", "Invalid Date"];
          if ((typeof cell === 'number' && isNaN(cell)) || (typeof cell === 'string' && errorStrings.includes(cell))) {
            const newRow = [...row];
            newRow[colIdx] = colActionValue as string | number | null;
            return newRow;
          }
        } else if (type === 'findReplace') {
          if (String(cell) === colActionFind) {
            const newRow = [...row];
            newRow[colIdx] = colActionReplace as string | number | null;
            return newRow;
          }
        }
        return row;
      });
      return { ...sheet, rows: newRows };
    });
    useExcelStore.getState().setWorkbook({ ...workbook, sheets: updatedSheets });
    setColActionDialog({ open: false, type: '', sheetName: '', colIdx: -1 });
  };

  return (
    <div className="space-y-4">
      {/* Always show upload section with loading prop */}
      <ExcelUploadSection onRead={handleFileRead} loading={loading} />
      {/* Show a message if no workbook is loaded */}
      {!workbook && (
        <div className="text-center text-muted-foreground py-12">
          <p className="text-lg font-semibold">No Excel workbook loaded</p>
          <p className="text-sm">Please upload an Excel file to begin.</p>
        </div>
      )}
      {/* Only render workbook-dependent UI if workbook is present */}
      {workbook && (
        <>
          <div className="flex items-center gap-2 text-2xl font-bold mb-4">
            <FileSpreadsheet className="w-6 h-6" />
            Excel Reader
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Upload Excel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0">
              <ExcelToolbar />
              {workbook && workbook.sheets.length > 0 && (
                <SheetTabs
                  workbook={workbook}
                  activeSheet={activeSheet}
                  setActiveSheet={setActiveSheet}
                  getTableRef={getTableRef}
                />
              )}
              {(!workbook || !workbook.sheets || workbook.sheets.length === 0) && !loading && (
                <div className="text-center text-gray-500 py-8">No data to display. Please upload an Excel file.</div>
              )}
            </CardContent>
          </Card>
          <RenameColumnDialog
            open={renameDialogOpen}
            onOpenChange={setRenameDialogOpen}
            value={renameValue}
            onValueChange={setRenameValue}
            current={renameCurrent}
            onConfirm={handleRenameConfirm}
          />
          <DropdownManageDialog
            open={dropdownDialogOpen}
            onOpenChange={setDropdownDialogOpen}
            input={dropdownInput}
            onInputChange={setDropdownInput}
            values={dropdownSheet && dropdownColIdx !== null ? (customDropdownValues[dropdownSheet]?.[dropdownColIdx] || []) : []}
            onAdd={handleAddDropdownValue}
            onRemove={handleRemoveDropdownValue}
          />
          {typeChangeDialog.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                <div className="font-semibold text-lg mb-2">Change Data Type</div>
                <div className="mb-4 text-gray-700">
                  Some cells in this column do not match the new data type.<br />
                  These cells will be <span className="font-semibold text-red-600">cleared</span> if you continue.<br />
                  Continue with data type change?
                </div>
                <div className="flex justify-end gap-2">
                  <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={handleCancelTypeChange}>Cancel</button>
                  <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={handleConfirmTypeChange}>Continue</button>
                </div>
              </div>
            </div>
          )}
          {/* Column Action Dialog (shadcn/ui) */}
          <Dialog open={colActionDialog.open} onOpenChange={open => setColActionDialog(d => ({ ...d, open }))}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {colActionDialog.type === 'replaceNulls' && 'Replace Null/Empty Values'}
                  {colActionDialog.type === 'replaceErrors' && 'Replace Error Values'}
                  {colActionDialog.type === 'findReplace' && 'Find and Replace'}
                </DialogTitle>
              </DialogHeader>
              <div className="py-2">
                {colActionDialog.type === 'findReplace' ? (
                  <>
                    <Input
                      autoFocus
                      placeholder="Find value"
                      value={colActionFind}
                      onChange={e => setColActionFind(e.target.value)}
                      className="mb-2"
                    />
                    <Input
                      placeholder="Replace with"
                      value={colActionReplace}
                      onChange={e => setColActionReplace(e.target.value)}
                    />
                  </>
                ) : (
                  <Input
                    autoFocus
                    placeholder="Replacement value"
                    value={colActionValue}
                    onChange={e => setColActionValue(e.target.value)}
                  />
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setColActionDialog(d => ({ ...d, open: false }))}>Cancel</Button>
                <Button onClick={handleColActionConfirm} disabled={colActionDialog.type === 'findReplace' ? (!colActionFind || !colActionReplace) : !colActionValue}>
                  {colActionDialog.type === 'findReplace' ? 'Replace' : 'Apply'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

// Helper to render Lucide React icon + label as HTML string for Tabulator
function menuLabel(Icon: React.ElementType, text: string) {
  return ReactDOMServer.renderToStaticMarkup(
    <span className="inline-flex items-center gap-2">
      <Icon size={16} strokeWidth={1.8} className="mr-1 min-w-[16px]" />
      <span>{text}</span>
    </span>
  );
}
