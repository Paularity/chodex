/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import * as Tabulator from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";
import { FileSpreadsheet, Pencil, Type, List, Eraser, XCircle, Replace, ListCollapse, Hash, Check, Calendar, Clock, Filter } from 'lucide-react';
import { toast } from "sonner";
import { ExcelToolbar } from '../ui/excel-toolbar';
import { ExcelUploadSection } from '@/components/ui/excel-upload-section';
import { SheetTabs } from '@/components/ui/sheet-tabs';
import { RenameColumnDialog } from '@/components/ui/rename-column-dialog';
import { DropdownManageDialog } from '@/components/ui/dropdown-manage-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useExcelStore } from '@/store/excelStore';
import type { ExcelSheet, ExcelColumn } from '@/lib/api/models/excel-workbook.model';
import { shadcnBooleanEditor, shadcnBooleanFormatter, menuLabel, removeBlankRows, convertValue, convertCellForTypeChange, TypeChangeDialog, ColumnActionDialog } from './ExcelReader/index';
import { DeleteMultipleColumnsDialog } from '@/components/ui/delete-multiple-columns-dialog';
import { ChangeMultipleTypesDialog } from '@/components/ui/change-multiple-types-dialog';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { FilterDialog } from '@/components/ui/filter-dialog';

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
    multiTypeDialog, setMultiTypeDialog, // <-- use from store
  } = useExcelStore();

  // Dropdown manage dialog state
  const [dropdownDialogOpen, setDropdownDialogOpen] = useState(false);
  const [dropdownSheet, setDropdownSheet] = useState<string | null>(null);
  const [dropdownColIdx, setDropdownColIdx] = useState<number | null>(null);
  const [dropdownInput, setDropdownInput] = useState('');
  const [paginationSize] = useState(15); // setPaginationSize is unused, so omit
  const tables = useRef<Record<string, any>>({});

  // Picker dialog state for data type change
  const [typeChangeDialog, setTypeChangeDialog] = useState({ open: false, sheetName: '', colIdx: -1, newType: '' });

  // Dialog state for column actions
  const [colActionDialog, setColActionDialog] = useState({ open: false, type: '', sheetName: '', colIdx: -1 });
  const [colActionValue, setColActionValue] = useState('');
  const [colActionFind, setColActionFind] = useState('');
  const [colActionReplace, setColActionReplace] = useState('');

  // Filter state for column filtering
  const [columnFilters, setColumnFilters] = useState<Array<{ sheet: string; colIdx: number; value: string; operator: string }>>([]);
  // Local state for filter dialog input
  const [filterDialog, setFilterDialog] = useState<{ open: boolean; sheet: string; colIdx: number; value: string; operator: string } | null>(null);

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

  const [showUploadSection, setShowUploadSection] = useState(true);

  // Hide upload section if workbook is loaded
  useEffect(() => {
    if (workbook) {
      setShowUploadSection(false);
    } else {
      setShowUploadSection(true);
    }
  }, [workbook]);

  // Refactored: handle file read logic for upload section
  const handleFileRead = async (file: File) => {
    try {
      const result = await readExcel(file);
      setShowUploadSection(false); // Hide upload section after file is read
      console.log("[ExcelReader] readExcel result:", result);
      if (!result || !result.sheets || result.sheets.length === 0) {
        toast.error("No valid sheets found in the imported Excel file.");
      } else {
        toast.success("Excel file imported successfully.");
        // Force activeSheet to first sheet after upload to ensure Tabulator is mounted
        if (result.sheets[0]?.sheetName) {
          setActiveSheet(result.sheets[0].sheetName);
        }
      }
    } catch {
      toast.error("Failed to read Excel file.");
    }
  };

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

  // Handler to delete a column from a sheet
  const handleDeleteColumn = (sheetName: string, colIdx: number) => {
    if (!workbook) return;
    const updatedSheets = workbook.sheets.map((sheet) => {
      if (sheet.sheetName !== sheetName) return sheet;
      return {
        ...sheet,
        columns: sheet.columns.filter((_, i) => i !== colIdx),
        rows: sheet.rows.map(row => row.filter((_, i) => i !== colIdx)),
      };
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
        // Only add index column if enabled for this sheet
        ...(indexColumnSheets.includes(sheet.sheetName)
          ? [{
            title: '#',
            field: '__rowIndex',
            width: 50,
            hozAlign: 'center',
            headerSort: false,
            formatter: (cell: unknown) => {
              // Tabulator rows are 0-based, display as 1-based
              // @ts-expect-error Tabulator cell type
              return String(cell.getRow().getData().__rowIndex ?? cell.getRow().getPosition());
            },
            frozen: true,
          }]
          : []),
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
            formatter = shadcnBooleanFormatter;
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
            headerContextMenu: function () {
              if (!editMode) {
                toast.error("Enable edit mode to modify columns.");
                return false; // Prevent menu from opening
              }
              return [
                {
                  label: menuLabel(ListCollapse, isDropdown ? "Use Text Input" : "Use Dropdown"),
                  action: () => setColumnDropdown(sheet.sheetName, colIdx, !isDropdown),
                },
                {
                  label: menuLabel(Pencil, "Rename Column"),
                  action: () => openRenameDialog(sheet.sheetName, colIdx, col.name),
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
                {
                  label: menuLabel(XCircle, 'Delete Column'),
                  action: () => handleDeleteColumn(sheet.sheetName, colIdx),
                },
                {
                  label: menuLabel(Filter, "Filter Column"),
                  action: () => setFilterDialog({ open: true, sheet: sheet.sheetName, colIdx, value: "", operator: "contains" }),
                },
              ];
            },
            // Remove headerClick filter clear logic
          };
        }),
      ];
      const dataRows = filtered
        ? removeBlankRows(sheet.rows, sheet.columns, sheet.columns.map((c: ExcelColumn) => c.name))
        : sheet.rows;
      // Filter rows if a filter is set for this sheet/column
      let filteredRows = dataRows;
      const activeFilters = columnFilters.filter(f => f.sheet === sheet.sheetName && (f.value !== "" || f.operator === 'isEmpty' || f.operator === 'isNotEmpty'));
      if (activeFilters.length > 0) {
        filteredRows = dataRows.filter(row => {
          return activeFilters.every(columnFilter => {
            const cellRaw = row[columnFilter.colIdx];
            const cellValue = String(cellRaw ?? "").toLowerCase();
            const filterValue = columnFilter.value.toLowerCase();
            switch (columnFilter.operator) {
              case 'equals':
                return cellValue === filterValue;
              case 'notEquals':
                return cellValue !== filterValue;
              case 'startsWith':
                return cellValue.startsWith(filterValue);
              case 'endsWith':
                return cellValue.endsWith(filterValue);
              case 'gt': {
                const n = Number(cellRaw);
                const f = Number(columnFilter.value);
                return !isNaN(n) && !isNaN(f) && n > f;
              }
              case 'gte': {
                const n = Number(cellRaw);
                const f = Number(columnFilter.value);
                return !isNaN(n) && !isNaN(f) && n >= f;
              }
              case 'lt': {
                const n = Number(cellRaw);
                const f = Number(columnFilter.value);
                return !isNaN(n) && !isNaN(f) && n < f;
              }
              case 'lte': {
                const n = Number(cellRaw);
                const f = Number(columnFilter.value);
                return !isNaN(n) && !isNaN(f) && n <= f;
              }
              case 'isEmpty':
                return cellValue === '';
              case 'isNotEmpty':
                return cellValue !== '';
              default:
                return cellValue.includes(filterValue);
            }
          });
        });
      }
      const data = filteredRows.map((row: (string | number | null)[], idx: number) => {
        const obj: Record<string, string | number | null> = {};
        // Add key/index columns if present
        if (row && typeof row === 'object' && '__rowKey' in row) {
          obj['__rowKey'] = (row as any)['__rowKey'];
        }
        if (row && typeof row === 'object' && '__rowIndex' in row) {
          obj['__rowIndex'] = (row as any)['__rowIndex'];
        }
        sheet.columns.forEach((col: ExcelColumn, i: number) => {
          obj[col.name] = row[i];
        });
        obj['__rowIdx'] = idx;
        return obj;
      });
      // Mount Tabulator directly to el (no extra scroll wrapper)
      const table = new Tabulator.TabulatorFull(el, {
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

  const handleMultiTypeConfirm = (changes: { colIdx: number; newType: string }[], cleanedRows?: (string | number | null)[][]) => {
    if (!workbook || !multiTypeDialog.sheetName) return;
    const updatedSheets = workbook.sheets.map(sheet => {
      if (sheet.sheetName !== multiTypeDialog.sheetName) return sheet;
      const newColumns = sheet.columns.map((col, idx) => {
        const found = changes.find(c => c.colIdx === idx);
        return found ? { ...col, dataType: found.newType } : col;
      });
      let newRows = sheet.rows;
      if (cleanedRows) {
        newRows = cleanedRows;
      } else if (changes.length > 0) {
        // If cleanedRows not provided, apply convertCellForTypeChange for each changed column
        newRows = sheet.rows.map(row => {
          const newRow = [...row];
          changes.forEach(({ colIdx, newType }) => {
            newRow[colIdx] = convertCellForTypeChange(row[colIdx], newType);
          });
          return newRow;
        });
      }
      return { ...sheet, columns: newColumns, rows: newRows };
    });
    useExcelStore.getState().setWorkbook({ ...workbook, sheets: updatedSheets });
    setMultiTypeDialog({ open: false, sheetName: '', columns: [] });
  };

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
                const converted = convertValue(cell, newType);
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

  const handleCancelTypeChange = () => {
    setTypeChangeDialog({ open: false, sheetName: '', colIdx: -1, newType: '' });
  };

  // Prop to control index column visibility per sheet
  const [indexColumnSheets, setIndexColumnSheets] = useState<string[]>([]);
  // Prop to control key column (GUID) visibility per sheet
  const [keyColumnSheets, setKeyColumnSheets] = useState<string[]>([]);

  // Show loading overlay when switching sheets
  const [sheetLoading, setSheetLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading table...');
  // Store scroll position for restoration per sheet
  const scrollPositionsRef = useRef<Record<string, { top: number, left: number }>>({});
  // Minimal Tabulator type for scroll methods
  interface TabulatorType {
    getScrollPosition: () => [number, number];
    scrollTo: (left: number, top: number) => void;
  }
  // Helper to get current Tabulator instance for the active sheet
  const getActiveTabulator = () => {
    if (!activeSheet) return null;
    const table = tables.current[activeSheet];
    if (table && typeof (table as TabulatorType).getScrollPosition === 'function') {
      return table as TabulatorType;
    }
    return null;
  };

  // Wrap setActiveSheet to show loading animation and preserve scroll per sheet
  const handleSetActiveSheet = (sheetName: string) => {
    // Save scroll position of current table for the current sheet
    if (activeSheet) {
      const tab = getActiveTabulator();
      if (tab) {
        const [left, top] = tab.getScrollPosition();
        scrollPositionsRef.current[activeSheet] = { top, left };
      }
    }
    setLoadingMessage('Switching sheet...');
    setSheetLoading(true);
    setTimeout(() => {
      setActiveSheet(sheetName);
      setSheetLoading(false);
      // Restore scroll for the new sheet after a short delay
      setTimeout(() => {
        const tabAfter = tables.current[sheetName];
        const pos = scrollPositionsRef.current[sheetName] || { left: 0, top: 0 };
        if (tabAfter && typeof (tabAfter as TabulatorType).scrollTo === 'function') {
          (tabAfter as TabulatorType).scrollTo(pos.left, pos.top);
        }
      }, 100);
    }, 1000); // 1 second for smooth transition
  };

  // Pass loading state setter to toolbar for animated feedback and preserve scroll per sheet
  const handleToolbarLoading = (fn: () => void, message = 'Updating table...') => {
    // Save scroll position of current table for the current sheet
    if (activeSheet) {
      const tab = getActiveTabulator();
      if (tab) {
        const [left, top] = tab.getScrollPosition();
        scrollPositionsRef.current[activeSheet] = { top, left };
      }
    }
    setLoadingMessage(message);
    setSheetLoading(true);
    setTimeout(() => {
      fn();
      setSheetLoading(false);
      // Restore scroll for the current sheet after a short delay
      setTimeout(() => {
        if (activeSheet) {
          const tabAfter = getActiveTabulator();
          const pos = scrollPositionsRef.current[activeSheet] || { left: 0, top: 0 };
          if (tabAfter && typeof tabAfter.scrollTo === 'function') {
            tabAfter.scrollTo(pos.left, pos.top);
          }
        }
      }, 100);
    }, 1000);
  };

  // Export only currently visible (filtered) data in the table for the active sheet
  const exportCurrentSheetWithVisibleData = () => {
    if (!activeSheet || !tables.current[activeSheet]) return;
    // Tabulator instance
    const tab = tables.current[activeSheet];
    // Try to get visible data (filtered, sorted, paginated)
    let data: Record<string, unknown>[] = [];
    if (typeof tab.getData === 'function') {
      data = tab.getData();
    } else if (typeof tab.getRows === 'function') {
      data = tab.getRows().map((row: any) => row.getData());
    }
    if (!data || data.length === 0) {
      window.alert('No rows to export.');
      return;
    }
    // Get columns from Tabulator definition
    const columns = typeof tab.getColumns === 'function'
      ? tab.getColumns().map((col: any) => col.getDefinition().title || col.getDefinition().field)
      : [];
    // Build CSV
    const csvRows: string[] = [];
    csvRows.push(columns.map((col: string) => '"' + (col ?? '') + '"').join(','));
    for (const row of data) {
      csvRows.push(columns.map((col: string) => '"' + ((row as Record<string, unknown>)[col] ?? '').toString().replace(/"/g, '""') + '"').join(','));
    }
    const csvContent = csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSheet || 'sheet'}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  return (
    <div className="space-y-4">
      {/* Only show upload section if showUploadSection is true */}
      {showUploadSection && (
        <section className="upload-section">
          <ExcelUploadSection onRead={handleFileRead} loading={loading} />
        </section>
      )}
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
            <CardContent className="space-y-2 p-4 pt-0">
              <ExcelToolbar
                indexColumnSheets={indexColumnSheets}
                setIndexColumnSheets={setIndexColumnSheets}
                keyColumnSheets={keyColumnSheets}
                setKeyColumnSheets={setKeyColumnSheets}
                onLoading={handleToolbarLoading}
                columnFilters={columnFilters}
                exportCurrentSheetWithVisibleData={exportCurrentSheetWithVisibleData}
                onOpenChangeMultipleTypes={() => setMultiTypeDialog({ open: true, sheetName: activeSheet || '', columns: [] })}
                onReupload={() => {
                  setShowUploadSection(true);
                  useExcelStore.getState().setWorkbook(null);
                  useExcelStore.getState().setWorkbookId(undefined);
                }}
              />
              {/* Show filter badges above the table if a filter is active for the current sheet */}
              {columnFilters.filter(f => f.sheet === activeSheet && (f.value !== "" || f.operator === 'isEmpty' || f.operator === 'isNotEmpty')).length > 0 && workbook && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {columnFilters.filter(f => f.sheet === activeSheet && (f.value !== "" || f.operator === 'isEmpty' || f.operator === 'isNotEmpty')).map((f) => {
                    const colName = workbook.sheets.find(s => s.sheetName === f.sheet)?.columns[f.colIdx]?.name;
                    const operatorLabel = (() => {
                      switch (f.operator) {
                        case 'equals': return 'equals';
                        case 'notEquals': return 'not equals';
                        case 'startsWith': return 'starts with';
                        case 'endsWith': return 'ends with';
                        case 'gt': return 'greater than';
                        case 'gte': return 'greater or equal';
                        case 'lt': return 'less than';
                        case 'lte': return 'less or equal';
                        case 'isEmpty': return 'is empty';
                        case 'isNotEmpty': return 'is not empty';
                        default: return 'contains';
                      }
                    })();
                    return (
                      <Badge
                        key={f.colIdx + '-' + f.operator + '-' + f.value}
                        variant="secondary"
                        className="flex items-center gap-2 px-3 py-1 text-sm border border-blue-500 bg-blue-100 text-blue-900 shadow-sm transition-all duration-300 ease-in-out hover:border-blue-700 focus:ring-2 focus:ring-blue-300 animate-in fade-in zoom-in cursor-pointer rounded-full"
                        tabIndex={0}
                        role="button"
                        aria-label={`Filter: ${colName} ${operatorLabel} ${f.value}`}
                        onClick={() => setColumnFilters(filters => filters.filter(fl => !(fl.sheet === f.sheet && fl.colIdx === f.colIdx && fl.operator === f.operator && fl.value === f.value)))}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setColumnFilters(filters => filters.filter(fl => !(fl.sheet === f.sheet && fl.colIdx === f.colIdx && fl.operator === f.operator && fl.value === f.value)));
                          }
                        }}
                      >
                        <span className="font-medium">Filter:</span>
                        <span className="font-semibold text-blue-700">{colName}</span>
                        <span className="text-blue-600">{operatorLabel}</span>
                        {f.operator !== 'isEmpty' && f.operator !== 'isNotEmpty' && (
                          <span className="max-w-[120px] truncate">{f.value}</span>
                        )}
                        <button
                          type="button"
                          className="ml-1 p-1 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200"
                          aria-label="Clear filter"
                          tabIndex={-1}
                          onClick={e => {
                            e.stopPropagation();
                            setColumnFilters(filters => filters.filter(fl => !(fl.sheet === f.sheet && fl.colIdx === f.colIdx && fl.operator === f.operator && fl.value === f.value)));
                          }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
              {workbook && workbook.sheets.length > 0 && (
                <div className="relative">
                  <SheetTabs
                    workbook={workbook}
                    activeSheet={activeSheet}
                    setActiveSheet={handleSetActiveSheet}
                    getTableRef={getTableRef}
                  />
                  {(loading || sheetLoading) && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-br from-black/70 via-gray-900/80 to-primary/80 backdrop-blur-sm rounded-xl">
                      <div className="flex flex-col items-center gap-6 p-8 rounded-2xl shadow-2xl bg-black/60 border border-primary/30 animate-fade-in">
                        <div className="relative flex items-center justify-center mb-2">
                          <div className="absolute animate-ping w-20 h-20 rounded-full bg-primary/30" />
                          <div className="animate-spin rounded-full border-4 border-t-primary border-gray-200 h-16 w-16 shadow-lg" />
                        </div>
                        <span className="text-2xl font-extrabold text-white drop-shadow-xl tracking-wide text-center select-none">
                          {loading ? 'Loading table...' : loadingMessage}
                        </span>
                        <span className="text-sm text-gray-200/80 mt-2 text-center select-none">Please wait while we process your data.</span>
                      </div>
                    </div>
                  )}
                </div>
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
          <TypeChangeDialog
            open={typeChangeDialog.open}
            onCancel={handleCancelTypeChange}
            onConfirm={handleConfirmTypeChange}
          />
          <ColumnActionDialog
            open={colActionDialog.open}
            type={colActionDialog.type as 'replaceNulls' | 'replaceErrors' | 'findReplace' | ''}
            value={colActionValue}
            find={colActionFind}
            replace={colActionReplace}
            onValueChange={setColActionValue}
            onFindChange={setColActionFind}
            onReplaceChange={setColActionReplace}
            onCancel={() => setColActionDialog(d => ({ ...d, open: false }))}
            onConfirm={handleColActionConfirm}
          />
          {/* Delete Multiple Columns Dialog using shadcn/ui components */}
          <DeleteMultipleColumnsDialog />
          <ChangeMultipleTypesDialog
            open={multiTypeDialog.open}
            columns={multiTypeDialog.columns}
            onClose={() => setMultiTypeDialog({ open: false, sheetName: '', columns: [] })}
            onConfirm={handleMultiTypeConfirm}
          />
          {/* Filter dialog for column filtering */}
          {filterDialog && (
            <FilterDialog
              open={filterDialog.open}
              sheetName={filterDialog.sheet}
              colIdx={filterDialog.colIdx}
              value={filterDialog.value}
              operator={filterDialog.operator}
              columnName={workbook?.sheets.find(s => s.sheetName === filterDialog.sheet)?.columns[filterDialog.colIdx]?.name || ''}
              onValueChange={val => setFilterDialog({ ...filterDialog, value: val })}
              onOperatorChange={op => setFilterDialog({ ...filterDialog, operator: op })}
              onCancel={() => setFilterDialog(null)}
              onApply={() => {
                setColumnFilters(prev => {
                  // Remove any existing filter for this sheet/colIdx
                  const filtered = prev.filter(f => !(f.sheet === filterDialog.sheet && f.colIdx === filterDialog.colIdx));
                  // Only add if not empty or isEmpty/isNotEmpty
                  if (filterDialog.value !== "" || filterDialog.operator === 'isEmpty' || filterDialog.operator === 'isNotEmpty') {
                    return [...filtered, { sheet: filterDialog.sheet, colIdx: filterDialog.colIdx, value: filterDialog.value, operator: filterDialog.operator }];
                  }
                  return filtered;
                });
                setFilterDialog(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
