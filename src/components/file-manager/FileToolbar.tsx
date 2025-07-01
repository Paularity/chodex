import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

export default function FileToolbar() {
  return (
    <div className="flex items-center gap-2 bg-muted p-2 rounded-md shadow-inner">
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="gap-1">
                <Plus className="w-4 h-4" /> New
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>New</TooltipContent>
        </Tooltip>
        <DropdownMenuContent>
          <DropdownMenuItem className="gap-1">
            <FolderPlus className="w-4 h-4" /> Folder
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-1">
            <FilePlus className="w-4 h-4" /> File
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="ghost" className="gap-1">
            <Scissors className="w-4 h-4" /> Cut
          </Button>
        </TooltipTrigger>
        <TooltipContent>Cut</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="ghost" className="gap-1">
            <CopyIcon className="w-4 h-4" /> Copy
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="ghost" className="gap-1">
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>

      <div className="flex-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="ghost" className="gap-1">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </Button>
        </TooltipTrigger>
        <TooltipContent>Refresh</TooltipContent>
      </Tooltip>
    </div>
  );
}
