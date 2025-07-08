import { useRef } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ExcelFileUploadProps {
    onFileSelect: (file: File) => void;
    disabled?: boolean;
}

export function ExcelFileUpload({ onFileSelect, disabled }: ExcelFileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (disabled) return;
        const file = e.dataTransfer.files[0];
        if (file) onFileSelect(file);
    };

    const handleBrowse = () => {
        if (!disabled) inputRef.current?.click();
    };

    return (
        <Card className="bg-background border border-border/60 shadow-none">
            <CardHeader>
                <CardTitle className="text-base">Basic</CardTitle>
                <CardDescription>Basic controlled file upload.</CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 mb-2 bg-muted/30 hover:bg-muted/40 transition cursor-pointer min-h-[180px]"
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={handleBrowse}
                    tabIndex={0}
                    role="button"
                >
                    <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                    <div className="font-medium text-center text-base mb-1">Drag &amp; drop files here</div>
                    <div className="text-xs text-muted-foreground mb-3">Or click to browse (max 2 files, up to 5MB each)</div>
                    <Button
                        type="button"
                        variant="outline"
                        className="text-sm px-4 py-1"
                        disabled={disabled}
                        onClick={e => { e.stopPropagation(); handleBrowse(); }}
                    >
                        Browse files
                    </Button>
                    <Input
                        ref={inputRef}
                        type="file"
                        accept=".xlsx"
                        className="hidden"
                        disabled={disabled}
                        onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) onFileSelect(file);
                        }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
