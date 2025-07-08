import { useState } from "react";
import { Button } from '@/components/ui/button';
import { UploadCloud, FileCheck2, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ExcelUploadSectionProps {
    loading: boolean;
    onRead: (file: File) => Promise<void>;
}

export function ExcelUploadSection({ loading, onRead }: ExcelUploadSectionProps) {
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    };

    const handleBrowse = () => {
        document.getElementById('excel-upload-input')?.click();
    };

    const handleRead = async () => {
        if (file) {
            await onRead(file);
            setFile(null);
        }
    };

    const handleReupload = () => {
        setFile(null);
        setTimeout(() => handleBrowse(), 0);
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="border border-border/60 rounded-lg bg-background p-4">
                <div className="mb-2 font-semibold text-base">Attachments</div>
                {!file ? (
                    <div
                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md min-h-[100px] p-4 transition cursor-pointer ${dragActive ? 'border-primary bg-muted/40' : 'border-muted-foreground/30 bg-muted/30 hover:bg-muted/40'}`}
                        onDrop={handleDrop}
                        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onClick={handleBrowse}
                        tabIndex={0}
                        role="button"
                    >
                        <UploadCloud className="w-7 h-7 mb-1 text-muted-foreground" />
                        <span className="font-medium text-center text-base mb-1">
                            Drag and drop or <span className="font-semibold underline">choose files</span> to upload
                        </span>
                        <Input
                            id="excel-upload-input"
                            type="file"
                            accept=".xlsx"
                            className="hidden"
                            disabled={loading}
                            onChange={e => {
                                const f = e.target.files?.[0];
                                if (f) setFile(f);
                            }}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-4 w-full">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-base text-center break-all">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <div className="flex w-lg gap-2 justify-center">
                            <Button
                                onClick={handleRead}
                                disabled={loading}
                                className="h-10 rounded-full bg-primary text-white font-semibold shadow-none hover:bg-primary/90 transition flex items-center gap-2 flex-1"
                                style={{ minWidth: 0 }}
                            >
                                {loading ? <span className="animate-spin">⏳</span> : <FileCheck2 className="w-4 h-4 mr-1" />}
                                Read
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleReupload}
                                className="h-10 px-4 rounded-full border border-input text-primary font-medium hover:bg-muted/60 transition flex items-center gap-2 flex-1"
                                disabled={loading}
                                style={{ minWidth: 0 }}
                            >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Re-upload
                            </Button>
                        </div>
                    </div>
                )}
                <div className="text-xs text-muted-foreground mt-2 mb-1">Upload up to 1 Excel file up to 5MB.</div>
            </div>
        </div>
    );
}
