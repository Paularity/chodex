import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ColumnActionDialogProps {
    open: boolean;
    type: 'replaceNulls' | 'replaceErrors' | 'findReplace' | '';
    value: string;
    find: string;
    replace: string;
    onValueChange: (v: string) => void;
    onFindChange: (v: string) => void;
    onReplaceChange: (v: string) => void;
    onCancel: () => void;
    onConfirm: () => void;
}

export const ColumnActionDialog: React.FC<ColumnActionDialogProps> = ({
    open, type, value, find, replace, onValueChange, onFindChange, onReplaceChange, onCancel, onConfirm
}) => (
    <Dialog open={open} onOpenChange={open => !open && onCancel()}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    {type === 'replaceNulls' && 'Replace Null/Empty Values'}
                    {type === 'replaceErrors' && 'Replace Error Values'}
                    {type === 'findReplace' && 'Find and Replace'}
                </DialogTitle>
            </DialogHeader>
            <div className="py-2">
                {type === 'findReplace' ? (
                    <>
                        <Input
                            autoFocus
                            placeholder="Find value"
                            value={find}
                            onChange={e => onFindChange(e.target.value)}
                            className="mb-2"
                        />
                        <Input
                            placeholder="Replace with"
                            value={replace}
                            onChange={e => onReplaceChange(e.target.value)}
                        />
                    </>
                ) : (
                    <Input
                        autoFocus
                        placeholder="Replacement value"
                        value={value}
                        onChange={e => onValueChange(e.target.value)}
                    />
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={onConfirm} disabled={type === 'findReplace' ? (!find || !replace) : !value}>
                    {type === 'findReplace' ? 'Replace' : 'Apply'}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);
