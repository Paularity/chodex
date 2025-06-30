import type { FileItem } from "@/lib/api/models/file.model";

interface Props {
  file?: FileItem;
}

export default function FileViewer({ file }: Props) {
  if (!file) return <p>Select a file to view details.</p>;

  return (
    <div className="space-y-2 text-sm">
      <h2 className="text-lg font-semibold">{file.name}</h2>
      <p className="text-muted-foreground">Type: {file.fileType}</p>
      <p className="text-muted-foreground">Size: {file.size} bytes</p>
      <p className="text-muted-foreground">Path: {file.fullPath}</p>
    </div>
  );
}

