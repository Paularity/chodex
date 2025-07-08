import React from 'react';

interface TypeChangeDialogProps {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export const TypeChangeDialog: React.FC<TypeChangeDialogProps> = ({ open, onCancel, onConfirm }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                <div className="font-semibold text-lg mb-2">Change Data Type</div>
                <div className="mb-4 text-gray-700">
                    Some cells in this column do not match the new data type.<br />
                    These cells will be <span className="font-semibold text-red-600">cleared</span> if you continue.<br />
                    Continue with data type change?
                </div>
                <div className="flex justify-end gap-2">
                    <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onCancel}>Cancel</button>
                    <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={onConfirm}>Continue</button>
                </div>
            </div>
        </div>
    );
};
