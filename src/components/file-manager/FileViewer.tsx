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
import {
  File as FileIcon,
  Folder as FolderIcon,
  User,
  Calendar,
  Lock,
  Shield,
  Tag as TagIcon,
  Hash as HashIcon,
} from "lucide-react";

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
          <dl className="border divide-y">
            <div className="grid grid-cols-[8rem_1fr] items-center">
              <dt className="flex items-center gap-1 px-4 py-2 text-muted-foreground">
                <FileIcon className="w-4 h-4" /> Type
              </dt>
              <dd className="px-4 py-2">{file.fileType}</dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] items-center">
              <dt className="flex items-center gap-1 px-4 py-2 text-muted-foreground">
                <FileIcon className="w-4 h-4" /> Size
              </dt>
              <dd className="px-4 py-2">{formatBytes(file.size)}</dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] items-center">
              <dt className="flex items-center gap-1 px-4 py-2 text-muted-foreground">
                <User className="w-4 h-4" /> Creator
              </dt>
              <dd className="px-4 py-2">{file.creator}</dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] items-center">
              <dt className="flex items-center gap-1 px-4 py-2 text-muted-foreground">
                <Calendar className="w-4 h-4" /> Modified
              </dt>
              <dd className="px-4 py-2">{format(new Date(file.stamp), "PPpp")}</dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] items-center">
              <dt className="flex items-center gap-1 px-4 py-2 text-muted-foreground">
                <Lock className="w-4 h-4" /> Read-only
              </dt>
              <dd className="px-4 py-2">{file.readOnly ? "Yes" : "No"}</dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] items-center">
              <dt className="flex items-center gap-1 px-4 py-2 text-muted-foreground">
                <Shield className="w-4 h-4" /> Encrypted
              </dt>
              <dd className="px-4 py-2">{file.encrypted ? "Yes" : "No"}</dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] items-center">
              <dt className="flex items-center gap-1 px-4 py-2 text-muted-foreground">
                <TagIcon className="w-4 h-4" /> Tags
              </dt>
              <dd className="px-4 py-2">{file.tags ?? "-"}</dd>
            </div>
            <div className="grid grid-cols-[8rem_1fr] items-center">
              <dt className="flex items-center gap-1 px-4 py-2 text-muted-foreground">
                <HashIcon className="w-4 h-4" /> Hash
              </dt>
              <dd className="px-4 py-2 break-all">{file.hash}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-muted-foreground px-6">No file selected.</p>
        )}
      </CardContent>
    </Card>
  );
}

