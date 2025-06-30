import type { FileItem } from "@/lib/api/models/file.model";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
  file?: FileItem;
}

export default function FileViewer({ file }: Props) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{file ? file.name : "Select a file"}</CardTitle>
        {file && <CardDescription className="truncate">{file.fullPath}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {file ? (
          <>
            <p className="text-muted-foreground">Type: {file.fileType}</p>
            <p className="text-muted-foreground">Size: {file.size} bytes</p>
            <p className="text-muted-foreground">Path: {file.fullPath}</p>
          </>
        ) : (
          <p className="text-muted-foreground">No file selected.</p>
        )}
      </CardContent>
    </Card>
  );
}

