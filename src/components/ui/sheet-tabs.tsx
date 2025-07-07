import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ExcelSheet } from '@/lib/api/models/excel-workbook.model';

interface SheetTabsProps {
    workbook: { sheets: ExcelSheet[] };
    activeSheet: string | null;
    setActiveSheet: (sheet: string) => void;
    getTableRef: (sheet: ExcelSheet, filtered: boolean) => (el: HTMLDivElement | null) => void;
}

export function SheetTabs({ workbook, activeSheet, setActiveSheet, getTableRef }: SheetTabsProps) {
    if (!workbook || !workbook.sheets.length) return null;
    return (
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
                    <div className="overflow-x-auto max-w-full">
                        <div
                            ref={getTableRef(sheet, false)}
                            id={`table-${idx}`}
                            className="w-full max-w-[1200px] mx-auto min-h-[200px] border bg-white align-top"
                        />
                    </div>
                </TabsContent>
            ))}
        </Tabs>
    );
}
