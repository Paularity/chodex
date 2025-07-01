import { Button } from "@/components/ui/button";
import {
  Plus,
  Scissors,
  Copy as CopyIcon,
  Trash2,
  RefreshCcw,
} from "lucide-react";

export default function FileToolbar() {
  return (
    <div className="flex items-center gap-2 bg-muted p-2 rounded-md shadow-inner">
      <Button size="sm" variant="ghost" className="gap-1">
        <Plus className="w-4 h-4" /> New
      </Button>
      <Button size="sm" variant="ghost" className="gap-1">
        <Scissors className="w-4 h-4" /> Cut
      </Button>
      <Button size="sm" variant="ghost" className="gap-1">
        <CopyIcon className="w-4 h-4" /> Copy
      </Button>
      <Button size="sm" variant="ghost" className="gap-1">
        <Trash2 className="w-4 h-4" /> Delete
      </Button>
      <div className="flex-1" />
      <Button size="sm" variant="ghost" className="gap-1">
        <RefreshCcw className="w-4 h-4" /> Refresh
      </Button>
    </div>
  );
}
