import { useState } from 'react';
import { Upload, Loader2, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useExcelStore } from '@/store/excelStore';

export default function ExcelReaderPage() {
  const { workbook, loading, readExcel } = useExcelStore();
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (!file) return;
    await readExcel(file);
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
            <div className="overflow-auto">
              {workbook.sheets.map((sheet) => (
                <div key={sheet.sheetName} className="mb-6">
                  <h3 className="font-semibold mb-2">{sheet.sheetName}</h3>
                  <table className="w-full text-sm border">
                    <thead className="bg-muted">
                      <tr>
                        {sheet.columns.map((col) => (
                          <th key={col.name} className="p-2 text-left font-semibold">
                            {col.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sheet.rows.map((row, i) => (
                        <tr key={i} className="border-t">
                          {row.map((cell, j) => (
                            <td key={j} className="p-2">
                              {String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
