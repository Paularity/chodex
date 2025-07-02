import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Plus,
  Scissors,
  Copy as CopyIcon,
  Trash2,
  RefreshCcw,
  FolderPlus,
  FilePlus,
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FileForm, { FileFormData } from "./FileForm";
import { useFileStore } from "@/store/fileStore";
import { toast } from "sonner";

export default function FileToolbar() {
  const createFile = useFileStore((s) => s.createFile);
  const fetchFiles = useFileStore((s) => s.fetchFiles);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const defaultValues: FileFormData = {
    name: "",
    fullPath: "",
    fileType: "",
    creator: "",
    readOnly: false,
    encrypted: false,
    stamp: new Date().toISOString(),
    size: 0,
    tags: "",
    hash: "",
  };

  return (
    <div className="flex items-center gap-2 bg-muted p-2 rounded-md shadow-inner">
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1 transition-transform duration-150 active:scale-95"
              >
                <Plus className="w-4 h-4" /> New
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>New</TooltipContent>
        </Tooltip>
        <DropdownMenuContent>
          <DropdownMenuItem className="gap-1 transition-colors duration-150">
            <FolderPlus className="w-4 h-4" /> Folder
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-1 transition-colors duration-150"
            onSelect={() => setOpen(true)}
          >
            <FilePlus className="w-4 h-4" /> File
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1 transition-transform duration-150 active:scale-95"
          >
            <Scissors className="w-4 h-4" /> Cut
          </Button>
        </TooltipTrigger>
        <TooltipContent>Cut</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1 transition-transform duration-150 active:scale-95"
          >
            <CopyIcon className="w-4 h-4" /> Copy
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1 transition-transform duration-150 active:scale-95"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>

      <div className="flex-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1 transition-transform duration-150 active:scale-95"
            onClick={() => fetchFiles()}
          >
            <RefreshCcw className="w-4 h-4" /> Refresh
          </Button>
        </TooltipTrigger>
        <TooltipContent>Refresh</TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create File</DialogTitle>
          </DialogHeader>
          <FileForm
            defaultValues={defaultValues}
            onSubmit={async (data) => {
              setSaving(true);
              try {
                await createFile(data);
                toast.success("File created");
                setOpen(false);
              } finally {
                setSaving(false);
              }
            }}
            loading={saving}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
