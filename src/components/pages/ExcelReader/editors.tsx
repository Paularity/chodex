import * as ReactDOM from 'react-dom/client';
import { Switch } from '@/components/ui/switch';

// Custom Tabulator boolean editor using shadcn Switch
export function shadcnBooleanEditor(
    cell: { getValue: () => unknown },
    onRendered: () => void,
    success: (value: boolean) => void
): HTMLElement {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    const root = ReactDOM.createRoot(container);
    const initial = cell.getValue() === true || cell.getValue() === 'true' || cell.getValue() === 1;
    root.render(
        <Switch
            checked={initial}
            onCheckedChange={val => {
                success(!!val);
            }}
            className="mx-auto"
            tabIndex={0}
            autoFocus
        />
    );
    onRendered();
    return container;
}

// Custom Tabulator boolean formatter using shadcn Switch (display only)
export function shadcnBooleanFormatter(cell: { getValue: () => unknown }): HTMLElement {
    const value = cell.getValue();
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    const root = ReactDOM.createRoot(container);
    root.render(
        <Switch
            checked={value === true || value === 'true' || value === 1}
            disabled={true}
            className="mx-auto opacity-70 pointer-events-none"
            tabIndex={-1}
        />
    );
    return container;
}
