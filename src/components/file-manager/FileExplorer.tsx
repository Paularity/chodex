import type { FileItem } from "@/lib/api/models/file.model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Props {
  files: FileItem[];
  onSelect: (file: FileItem) => void;
  selectedId?: string;
  loading?: boolean;
}

export default function FileExplorer({ files, onSelect, selectedId, loading }: Props) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Explorer</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : files.length ? (
          <ul className="space-y-1">
            {files.map((f) => (
              <li key={f.id}>
                <Button
                  variant={selectedId === f.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onSelect(f)}
                >
                  {f.name}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-2 text-muted-foreground">No files found.</p>
        )}
      </CardContent>
    </Card>
  );
}

