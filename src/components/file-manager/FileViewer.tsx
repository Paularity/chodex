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
import { File as FileIcon, Folder as FolderIcon } from "lucide-react";

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
  const isFolder =
    file?.fileType.toLowerCase() === "folder" ||
    file?.fileType.toLowerCase() === "directory";

  return (
    <Card className="h-full">
      <CardHeader className="bg-muted/50 border-b space-y-1">
        <div className="flex items-center gap-2">
          {file ? (
            isFolder ? (
              <FolderIcon className="w-5 h-5 text-muted-foreground" />
            ) : (
              <FileIcon className="w-5 h-5 text-muted-foreground" />
            )
          ) : null}
          <CardTitle>{file ? file.name : "Select a file"}</CardTitle>
        </div>
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
      <CardContent className="text-sm px-0">
        {file ? (
          <table className="w-full text-sm border">
            <tbody className="divide-y">
              <tr>
                <th className="w-32 px-4 py-2 text-left font-normal text-muted-foreground">
                  Type
                </th>
                <td className="px-4 py-2">{file.fileType}</td>
              </tr>
              <tr>
                <th className="w-32 px-4 py-2 text-left font-normal text-muted-foreground">
                  Size
                </th>
                <td className="px-4 py-2">{formatBytes(file.size)}</td>
              </tr>
              <tr>
                <th className="w-32 px-4 py-2 text-left font-normal text-muted-foreground">
                  Creator
                </th>
                <td className="px-4 py-2">{file.creator}</td>
              </tr>
              <tr>
                <th className="w-32 px-4 py-2 text-left font-normal text-muted-foreground">
                  Modified
                </th>
                <td className="px-4 py-2">
                  {format(new Date(file.stamp), "PPpp")}
                </td>
              </tr>
              <tr>
                <th className="w-32 px-4 py-2 text-left font-normal text-muted-foreground">
                  Read-only
                </th>
                <td className="px-4 py-2">{file.readOnly ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <th className="w-32 px-4 py-2 text-left font-normal text-muted-foreground">
                  Encrypted
                </th>
                <td className="px-4 py-2">{file.encrypted ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <th className="w-32 px-4 py-2 text-left font-normal text-muted-foreground">
                  Tags
                </th>
                <td className="px-4 py-2">{file.tags ?? "-"}</td>
              </tr>
              <tr>
                <th className="w-32 px-4 py-2 text-left font-normal text-muted-foreground">
                  Hash
                </th>
                <td className="px-4 py-2 break-all">{file.hash}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="text-muted-foreground px-6">No file selected.</p>
        )}
      </CardContent>
    </Card>
  );
}

