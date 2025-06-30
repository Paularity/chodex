import type { FileItem } from "@/lib/api/models/file.model";

interface Props {
  files: FileItem[];
  onSelect: (file: FileItem) => void;
  selectedId?: string;
}

export default function FileExplorer({ files, onSelect, selectedId }: Props) {
  if (!files.length) {
    return <p>No files found.</p>;
  }

  return (
    <ul className="space-y-1">
      {files.map((f) => (
        <li
          key={f.id}
          onClick={() => onSelect(f)}
          className={`p-1 cursor-pointer rounded ${selectedId === f.id ? "bg-accent" : "hover:bg-muted"}`}
        >
          {f.name}
        </li>
      ))}
    </ul>
  );
}

