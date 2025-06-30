import type { FileItem } from "@/lib/api/models/file.model";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Folder as FolderIcon, File as FileIcon } from "lucide-react";
import { useState } from "react";

interface Props {
  files: FileItem[];
  onSelect: (file: FileItem) => void;
  selectedId?: string;
  loading?: boolean;
}

interface TreeNode {
  name: string;
  path: string;
  children?: TreeNode[];
  file?: FileItem;
  isFolder: boolean;
}

function buildTree(files: FileItem[]): TreeNode[] {
  const root: TreeNode[] = [];
  for (const file of files) {
    const parts = file.fullPath.replace(/^\/+/, "").split("/");
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const path = `/${parts.slice(0, i + 1).join("/")}`;
      const isLast = i === parts.length - 1;
      let node = current.find((n) => n.name === part);
      if (!node) {
        node = {
          name: part,
          path,
          children: [],
          isFolder: !isLast ||
            ["folder", "directory"].includes(file.fileType.toLowerCase()),
        };
        if (isLast && !node.isFolder) {
          node.file = file;
        }
        current.push(node);
      }
      if (isLast) {
        if (node.isFolder) {
          node.file = file;
        }
      } else {
        node.children = node.children || [];
        current = node.children;
      }
    }
  }
  return root;
}

export default function FileExplorer({ files, onSelect, selectedId, loading }: Props) {
  const tree = buildTree(files);

  function Node({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
    const [open, setOpen] = useState(true);
    const isSelected = selectedId && node.file?.id === selectedId;

    return (
      <li>
        <div className="flex items-center" style={{ marginLeft: depth * 12 }}>
          {node.isFolder ? (
            <Button
              variant="ghost"
              size="icon"
              className="mr-1 h-6 w-6"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <FolderIcon className="w-4 h-4" /> : <FolderIcon className="w-4 h-4 opacity-50" />}
            </Button>
          ) : (
            <FileIcon className="w-4 h-4 mr-1" />
          )}
          {node.file ? (
            <Button
              variant={isSelected ? "secondary" : "ghost"}
              className="flex-1 justify-start"
              onClick={() => node.file && onSelect(node.file)}
            >
              {node.name}
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">{node.name}</span>
          )}
        </div>
        {open && node.children && node.children.length > 0 && (
          <ul className="space-y-1">
            {node.children.map((c) => (
              <Node key={c.path} node={c} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  }

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
        ) : tree.length ? (
          <ul className="space-y-1">
            {tree.map((node) => (
              <Node key={node.path} node={node} />
            ))}
          </ul>
        ) : (
          <p className="p-2 text-muted-foreground">No files found.</p>
        )}
      </CardContent>
    </Card>
  );
}

