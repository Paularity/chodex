import type { FileItem } from "@/lib/api/models/file.model";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Loader2,
  Folder as FolderIcon,
  File as FileIcon,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
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
        <div
          className={
            "group flex items-center rounded-sm pr-2 transition-all duration-200 cursor-pointer" +
            (isSelected
              ? " bg-blue-600 text-white"
              : " hover:bg-accent/50 active:scale-[0.98]")
          }
          style={{ marginLeft: depth * 12 }}
          onClick={() => {
            if (node.isFolder) {
              setOpen((o) => !o);
            } else if (node.file) {
              onSelect(node.file);
            }
          }}
        >
          {node.isFolder ? (
            <Button
              variant="ghost"
              size="icon"
              className="mr-1 h-5 w-5 transition-transform duration-150 active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((o) => !o);
              }}
            >
              {open ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          ) : (
            <span className="w-5 mr-1" />
          )}
          {node.isFolder ? (
            <FolderIcon className="w-4 h-4 mr-1" />
          ) : (
            <FileIcon className="w-4 h-4 mr-1" />
          )}
          {node.file ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex-1 truncate py-1">{node.name}</span>
              </TooltipTrigger>
              <TooltipContent>{node.file.fullPath}</TooltipContent>
            </Tooltip>
          ) : (
            <span className="flex-1 text-sm text-muted-foreground py-1">{node.name}</span>
          )}
        </div>
        {open && node.children && node.children.length > 0 && (
          <ul className="space-y-0.5">
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
      <CardContent className="p-1">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : tree.length ? (
          <div className="overflow-auto max-h-[60vh]">
            <ul className="space-y-0.5">
              {tree.map((node) => (
                <Node key={node.path} node={node} />
              ))}
            </ul>
          </div>
        ) : (
          <p className="p-2 text-muted-foreground">No files found.</p>
        )}
      </CardContent>
    </Card>
  );
}

