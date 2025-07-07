import { useState, useRef, useEffect } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";
import { FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useExcelStore } from '@/store/excelStore';
import type { ExcelWorkbook, ExcelSheet, ExcelColumn } from '@/lib/api/models/excel-workbook.model';
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input as ShadInput } from '@/components/ui/input';

export default function ExcelReaderPage() {
  const { workbook, loading, readExcel } = useExcelStore();
  const [file, setFile] = useState<File | null>(null);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [showFiltered, setShowFiltered] = useState(false);
  // Store Tabulator instances for cleanup
  const tables = useRef<Record<string, object>>({});

  // Cleanup Tabulator tables on unmount or when workbook changes
  useEffect(() => {
    Object.values(tables.current).forEach((t) => (t as any)?.destroy && (t as any).destroy());
    tables.current = {};
  }, [workbook]);

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }
    try {
      const result = await readExcel(file);
      console.log("[ExcelReader] readExcel result:", result);
      if (!result || !result.sheets || result.sheets.length === 0) {
        toast.warning("No data found in the uploaded Excel file.");
      } else {
        toast.success("Excel file loaded successfully.");
      }
    } catch (err: any) {
      toast.error("Failed to read Excel file.");
    }
    setFile(null);
  };

  // Utility: Remove blank rows based on required column keys
  function removeBlankRows(
    rows: (string | number | null)[][],
    columns: ExcelColumn[],
    requiredKeys: string[]
  ): (string | number | null)[][] {
    const keyIndexes = requiredKeys.map(
      (key) => columns.findIndex((col) => col.name === key)
    );
    // Only consider a row blank if ALL required keys are blank
    return rows.filter((row) =>
      keyIndexes.some((idx) => {
        const val = row[idx];
        return val !== undefined && val !== null && String(val).trim() !== "";
      })
    );
  }

  // Remove blank rows from the actual sheet data (permanently) when button is clicked
  const handleRemoveRows = (sheetName: string) => {
    if (!workbook) return;
    const updatedSheets = workbook.sheets.map((sheet) => {
      if (sheet.sheetName !== sheetName) return sheet;
      return {
        ...sheet,
        rows: removeBlankRows(sheet.rows, sheet.columns, sheet.columns.map((c) => c.name)),
      };
    });
    // Update the workbook in the store
    useExcelStore.getState().setWorkbook({ ...workbook, sheets: updatedSheets });
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

  // State for rename dialog
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameSheet, setRenameSheet] = useState<string | null>(null);
  const [renameColIdx, setRenameColIdx] = useState<number | null>(null);
  const [renameCurrent, setRenameCurrent] = useState('');
  const [renameValue, setRenameValue] = useState('');

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

  // Callback ref to initialize Tabulator when container is mounted
  const getTableRef = (sheet: ExcelSheet, filtered: boolean) => (el: HTMLDivElement | null) => {
    if (!el || !workbook) return;
    if (tables.current[sheet.sheetName] && (tables.current[sheet.sheetName] as any).destroy) {
      (tables.current[sheet.sheetName] as any).destroy();
    }
    el.innerHTML = "";
    setTimeout(() => {
      const columns = [
        ...sheet.columns.map((col: ExcelColumn, colIdx) => ({
          title: col.name,
          field: col.name,
          headerContextMenu: [
            {
              label: "Rename Column",
              action: () => {
                openRenameDialog(sheet.sheetName, colIdx, col.name);
              },
              icon: () => {
                return `<svg xmlns='http://www.w3.org/2000/svg' class='inline-block mr-1' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 20h9'/><path d='M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z'/></svg>`;
              },
            },
          ],
        })),
      ];
      const dataRows = filtered
        ? removeBlankRows(sheet.rows, sheet.columns, sheet.columns.map((c) => c.name))
        : sheet.rows;
      const data = dataRows.map((row: (string | number | null)[], idx) => {
        const obj: Record<string, string | number | null> = {};
        sheet.columns.forEach((col, i) => {
          obj[col.name] = row[i];
        });
        obj['__rowIdx'] = idx;
        return obj;
      });
      const table = new Tabulator(el, {
        data,
        columns,
        layout: "fitDataTable",
        rowFormatter: (row: any) => { },
        rowContextMenu: [
          {
            label: "Delete Row",
            action: function (e: MouseEvent, row: any) {
              const rowIdx = row.getPosition();
              handleDeleteRow(sheet.sheetName, rowIdx - 1);
            },
            icon: () => {
              return `<svg xmlns='http://www.w3.org/2000/svg' class='inline-block mr-1' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 18L18 6M6 6l12 12'/></svg>`;
            },
          },
          {
            label: "Use Row as Header",
            action: function (e: MouseEvent, row: any) {
              const rowIdx = row.getPosition();
              handleUseRowAsHeader(sheet.sheetName, rowIdx - 1);
            },
            icon: () => {
              return `<svg xmlns='http://www.w3.org/2000/svg' class='inline-block mr-1' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 6h16M4 12h16M4 18h16'/></svg>`;
            },
          },
        ],
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-bold mb-4">
        <FileSpreadsheet className="w-6 h-6" />
        Excel Reader
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upload Excel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept=".xlsx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <Button
              onClick={handleSubmit}
              disabled={!file || loading}
              className="gap-2"
            >
              {loading && <span className="animate-spin">⏳</span>}
              Read
            </Button>
          </div>
          {workbook && workbook.sheets.length > 0 && (
            <>
              <Tabs value={activeSheet || workbook.sheets[0].sheetName} onValueChange={setActiveSheet} className="w-full">
                <TabsList className="mb-2">
                  {workbook.sheets.map((sheet) => (
                    <TabsTrigger key={sheet.sheetName} value={sheet.sheetName} className="capitalize">
                      {sheet.sheetName}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {workbook.sheets.map((sheet, idx) => (
                  <TabsContent key={sheet.sheetName} value={sheet.sheetName} className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <Button
                        variant="destructive"
                        onClick={() => handleRemoveRows(sheet.sheetName)}
                        className="text-xs px-3 py-1"
                      >
                        Remove Empty Rows
                      </Button>
                    </div>
                    <div
                      ref={getTableRef(sheet, false)}
                      id={`table-${idx}`}
                      className="w-full min-h-[200px] border bg-white"
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </>
          )}
          {(!workbook || !workbook.sheets || workbook.sheets.length === 0) && !loading && (
            <div className="text-center text-gray-500 py-8">No data to display. Please upload an Excel file.</div>
          )}
        </CardContent>
      </Card>
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="max-w-sm w-full">
          <DialogHeader>
            <DialogTitle>Rename Column</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleRenameConfirm();
            }}
            className="space-y-4"
          >
            <ShadInput
              autoFocus
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              className="w-full"
              placeholder="New column name"
            />
            <DialogFooter className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!renameValue.trim() || renameValue === renameCurrent}>
                Rename
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
