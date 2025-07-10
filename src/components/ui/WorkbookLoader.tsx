/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useExcelStore } from "@/store/excelStore";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function WorkbookLoader() {
    const {
        listWorkbooks,
        getWorkbook,
        setWorkbook,
        setWorkbookId,
        workbookId
    } = useExcelStore();
    const [workbooks, setWorkbooks] = useState<Array<{ id: string; name: string }>>([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

    useEffect(() => {
        async function fetchWorkbooks() {
            setLoading(true);
            const result = await listWorkbooks();
            // Accepts array or { data: array }
            let arr = Array.isArray(result) ? result : (result?.data || []);
            // Normalize to { id, name }
            arr = arr.map((w: any) => ({ id: w.id, name: w.name || w.workbookName || w.title || `Workbook ${w.id}` }));
            setWorkbooks(arr);
            setLoading(false);
        }
        fetchWorkbooks();
    }, [listWorkbooks]);

    const handleLoad = async () => {
        if (!selectedId) return;
        setLoading(true);
        const wb = await getWorkbook(selectedId);
        // Accepts { data: { data: stringified workbook, id } } or direct workbook
        let workbook = wb;
        let realId = selectedId;
        if (wb && typeof wb === 'object' && 'data' in wb && wb.data) {
            if (typeof wb.data.data === 'string') {
                try {
                    workbook = JSON.parse(wb.data.data);
                } catch {
                    workbook = null;
                }
            } else if (typeof wb.data === 'object') {
                workbook = wb.data;
            }
            if ('id' in wb.data) realId = wb.data.id;
        }
        setWorkbook(workbook);
        setWorkbookId(realId);
        setLoading(false);
    };

    const current = workbooks.find(w => w.id === workbookId);
    const selected = workbooks.find(w => w.id === selectedId);

    return (
        <div className="mb-4 flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 min-w-[180px]">
                        {loading ? "Loading..." : (selected ? selected.name : current ? current.name : "Select Workbook")}
                        <ChevronDown className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {workbooks.map(wb => (
                        <DropdownMenuItem
                            key={wb.id}
                            onSelect={() => setSelectedId(wb.id)}
                            className={wb.id === selectedId ? "font-semibold bg-accent text-accent-foreground" : ""}
                        >
                            {wb.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <Button
                variant="default"
                disabled={!selectedId || loading}
                onClick={handleLoad}
            >
                Load
            </Button>
        </div>
    );
}
