import type { FileItem } from "@/lib/api/models/file.model";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { format } from "date-fns";

interface Props {
  file?: FileItem;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}

export default function FileViewer({ file }: Props) {
  return (
    <Card className="h-full">
      <CardHeader className="bg-muted/50 border-b">
        <CardTitle>{file ? file.name : "Select a file"}</CardTitle>
        {file && (
          <Tooltip>
            <TooltipTrigger asChild>
              <CardDescription className="truncate text-muted-foreground">
                {file.fullPath}
              </CardDescription>
            </TooltipTrigger>
            <TooltipContent>{file.fullPath}</TooltipContent>
          </Tooltip>
        )}
      </CardHeader>
      <CardContent className="text-sm">
        {file ? (
          <dl className="grid grid-cols-[max-content_1fr] gap-x-2 gap-y-1">
            <dt className="text-muted-foreground">Type</dt>
            <dd>{file.fileType}</dd>
            <dt className="text-muted-foreground">Size</dt>
            <dd>{formatBytes(file.size)}</dd>
            <dt className="text-muted-foreground">Creator</dt>
            <dd>{file.creator}</dd>
            <dt className="text-muted-foreground">Modified</dt>
            <dd>{format(new Date(file.stamp), "PPpp")}</dd>
            <dt className="text-muted-foreground">Read-only</dt>
            <dd>{file.readOnly ? "Yes" : "No"}</dd>
            <dt className="text-muted-foreground">Encrypted</dt>
            <dd>{file.encrypted ? "Yes" : "No"}</dd>
            <dt className="text-muted-foreground">Tags</dt>
            <dd>{file.tags ?? "-"}</dd>
            <dt className="text-muted-foreground">Hash</dt>
            <dd className="break-all">{file.hash}</dd>
          </dl>
        ) : (
          <p className="text-muted-foreground">No file selected.</p>
        )}
      </CardContent>
    </Card>
  );
}

