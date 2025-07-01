import type { FileItem } from "@/lib/api/models/file.model";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
  file?: FileItem;
}

export default function FileViewer({ file }: Props) {
  return (
    <Card className="h-full">
      <CardHeader className="bg-muted/50 border-b">
        <CardTitle>{file ? file.name : "Select a file"}</CardTitle>
        {file && (
          <CardDescription className="truncate text-muted-foreground">
            {file.fullPath}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="text-sm">
        {file ? (
          <dl className="grid grid-cols-[max-content_1fr] gap-x-2 gap-y-1">
            <dt className="text-muted-foreground">Type</dt>
            <dd>{file.fileType}</dd>
            <dt className="text-muted-foreground">Size</dt>
            <dd>{file.size.toLocaleString()} bytes</dd>
            <dt className="text-muted-foreground">Creator</dt>
            <dd>{file.creator}</dd>
            <dt className="text-muted-foreground">Path</dt>
            <dd className="truncate">{file.fullPath}</dd>
          </dl>
        ) : (
          <p className="text-muted-foreground">No file selected.</p>
        )}
      </CardContent>
    </Card>
  );
}

