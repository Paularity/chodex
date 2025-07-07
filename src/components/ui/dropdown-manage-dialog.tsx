import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input as ShadInput } from '@/components/ui/input';

interface DropdownManageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    input: string;
    onInputChange: (v: string) => void;
    values: string[];
    onAdd: () => void;
    onRemove: (val: string) => void;
}

export function DropdownManageDialog({ open, onOpenChange, input, onInputChange, values, onAdd, onRemove }: DropdownManageDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm w-full">
                <DialogHeader>
                    <DialogTitle>Manage Dropdown Items</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <ShadInput
                            value={input}
                            onChange={e => onInputChange(e.target.value)}
                            className="w-full"
                            placeholder="Add new value"
                        />
                        <Button type="button" onClick={onAdd} disabled={!input.trim()}>
                            Add
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {values.length > 0
                            ? values.map((val) => (
                                <span key={val} className="inline-flex items-center bg-gray-100 rounded px-2 py-1 text-xs">
                                    {val}
                                    <button type="button" className="ml-1 text-red-500 hover:text-red-700" onClick={() => onRemove(val)}>
                                        &times;
                                    </button>
                                </span>
                            ))
                            : <span className="text-gray-400 text-xs">No custom values</span>
                        }
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
