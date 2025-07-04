import { useState, useRef, useEffect } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";
import { Upload, Loader2, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useExcelStore } from '@/store/excelStore';

export default function ExcelReaderPage() {
  const { workbook, loading, readExcel } = useExcelStore();
  const [file, setFile] = useState<File | null>(null);
  const tableContainers = useRef<Record<string, HTMLDivElement | null>>({});
  interface TabulatorInstance {
    destroy?: () => void;
  }
  const tables = useRef<Record<string, TabulatorInstance>>({});

  useEffect(() => {
    if (!workbook) return;

    workbook.sheets.forEach((sheet) => {
      const container = tableContainers.current[sheet.sheetName];
      if (!container) return;
      if (tables.current[sheet.sheetName]) {
        tables.current[sheet.sheetName].destroy();
      }
      const data = sheet.rows.map((row) => {
        const obj: Record<string, string | number | null> = {};
        sheet.columns.forEach((col, i) => {
          obj[col.name] = row[i];
        });
        return obj;
      });
      tables.current[sheet.sheetName] = new Tabulator(container, {
        data,
        columns: sheet.columns.map((col) => ({ title: col.name, field: col.name })),
        layout: "fitDataTable",
      });
    });

    return () => {
      Object.values(tables.current).forEach((t) => t.destroy && t.destroy());
      tables.current = {};
    };
  }, [workbook]);

  const handleSubmit = async () => {
    if (!file) return;
    await readExcel(file);
    setFile(null);
  };

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
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <Upload className="w-4 h-4" /> Read
            </Button>
          </div>
          {workbook && (
            <div className="space-y-8">
              {workbook.sheets.map((sheet, idx) => (
                <div key={sheet.sheetName} className="space-y-2">
                  <h3 className="font-semibold">{sheet.sheetName}</h3>
                  <div
                    ref={(el) => {
                      tableContainers.current[sheet.sheetName] = el;
                    }}
                    id={`table-${idx}`}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
