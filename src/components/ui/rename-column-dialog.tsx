import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input as ShadInput } from '@/components/ui/input';

interface RenameColumnDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    value: string;
    onValueChange: (v: string) => void;
    current: string;
    onConfirm: () => void;
}

export function RenameColumnDialog({ open, onOpenChange, value, onValueChange, current, onConfirm }: RenameColumnDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm w-full">
                <DialogHeader>
                    <DialogTitle>Rename Column</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        onConfirm();
                    }}
                    className="space-y-4"
                >
                    <ShadInput
                        autoFocus
                        value={value}
                        onChange={e => onValueChange(e.target.value)}
                        className="w-full"
                        placeholder="New column name"
                    />
                    <DialogFooter className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!value.trim() || value === current}>
                            Rename
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
