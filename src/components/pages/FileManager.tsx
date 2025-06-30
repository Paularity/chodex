import { useEffect, useState } from "react";
import { Folder } from "lucide-react";
import { useFileStore } from "@/store/fileStore";
import type { FileItem } from "@/lib/api/models/file.model";
import FileExplorer from "../file-manager/FileExplorer";
import FileViewer from "../file-manager/FileViewer";

export default function FileManagerPage() {
  const { files, fetchFiles, loading } = useFileStore();
  const [selected, setSelected] = useState<FileItem | undefined>();

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-bold mb-4">
        <Folder className="w-6 h-6" /> Files
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <FileExplorer
          files={files}
          loading={loading}
          onSelect={setSelected}
          selectedId={selected?.id}
        />
        <div className="md:col-span-2">
          <FileViewer file={selected} />
        </div>
      </div>
    </div>
  );
}

