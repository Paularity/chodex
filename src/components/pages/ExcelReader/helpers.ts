import ReactDOMServer from 'react-dom/server';
import type { ExcelColumn } from '@/lib/api/models/excel-workbook.model';
import React from 'react';

// Helper to render Lucide React icon + label as HTML string for Tabulator
export function menuLabel(Icon: React.ElementType, text: string) {
    return ReactDOMServer.renderToStaticMarkup(
        React.createElement(
            'span',
            { className: 'inline-flex items-center gap-2' },
            React.createElement(Icon, { size: 16, strokeWidth: 1.8, className: 'mr-1 min-w-[16px]' }),
            React.createElement('span', null, text)
        )
    );
}

// Utility: Remove blank rows based on required column keys
export function removeBlankRows(
    rows: (string | number | null)[][],
    columns: ExcelColumn[],
    requiredKeys: string[]
): (string | number | null)[][] {
    const keyIndexes = requiredKeys.map(
        (key) => columns.findIndex((col: ExcelColumn) => col.name === key)
    );
    // Only consider a row blank if ALL required keys are blank
    return rows.filter((row: (string | number | null)[]) =>
        keyIndexes.some((idx: number) => {
            const val = row[idx];
            return val !== undefined && val !== null && String(val).trim() !== "";
        })
    );
}

// Helper to convert value to new type (moved to component scope)
export function convertValue(val: unknown, type: string): string | number | null {
    // ...existing code for convertValue from ExcelReaderPage...
    if (val === null || val === undefined) {
        switch (type) {
            case "number": return val === null ? 0 : NaN;
            case "boolean": return 0;
            case "string": return "";
            case "date": return null;
            case "datetime": return null;
            case "time": return null;
            default: return null;
        }
    }
    if (Array.isArray(val)) {
        switch (type) {
            case "boolean": return 1;
            case "number": return val.length === 0 ? 0 : val.length === 1 ? Number(val[0]) : NaN;
            case "string": return val.toString();
            default: return null;
        }
    }
    if (typeof val === "object" && !(val instanceof Date)) {
        switch (type) {
            case "boolean": return 1;
            case "number": return NaN;
            case "string": return "[object Object]";
            default: return null;
        }
    }
    if (val instanceof Date) {
        switch (type) {
            case "number": return val.getTime();
            case "string": return val.toString();
            case "boolean": return 1;
            default: return null;
        }
    }
    switch (type) {
        case "number": {
            if (typeof val === "number") return val;
            if (typeof val === "boolean") return val ? 1 : 0;
            if (typeof val === "string") {
                const n = Number(val);
                if (!isNaN(n)) return n;
                const d = new Date(val as string);
                return isNaN(d.getTime()) ? NaN : d.getTime();
            }
            return NaN;
        }
        case "boolean": {
            if (typeof val === "boolean") return val ? 1 : 0;
            if (typeof val === "number") return val !== 0 && !isNaN(val) ? 1 : 0;
            if (typeof val === "string") {
                if (val === "") return 0;
                if (val === "false") return 0;
                if (val === "true") return 1;
                return 1;
            }
            return 0;
        }
        case "string": {
            if (typeof val === "string") return val;
            if (typeof val === "number" || typeof val === "boolean" || val === null || val === undefined) return String(val);
            if (val instanceof Date) return val.toString();
            if (Array.isArray(val)) return val.toString();
            if (typeof val === "object") return "[object Object]";
            return String(val);
        }
        case "date": {
            type LuxonDateTime = {
                fromJSDate: (date: Date) => { isValid: boolean; toFormat: (fmt: string) => string; toISO: (opts?: object) => string | null };
            };
            type WindowWithLuxon = typeof window & { luxon?: { DateTime?: LuxonDateTime } };
            const { DateTime } = (window as WindowWithLuxon).luxon || {};
            if (DateTime) {
                const dt = DateTime.fromJSDate(new Date(typeof val === 'string' || typeof val === 'number' || val instanceof Date ? val : ''));
                return dt.isValid ? dt.toFormat("yyyy-MM-dd") : null;
            }
            const d = new Date(typeof val === 'string' || typeof val === 'number' || val instanceof Date ? val : '');
            return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
        }
        case "datetime": {
            type LuxonDateTime = {
                fromJSDate: (date: Date) => { isValid: boolean; toFormat: (fmt: string) => string; toISO: (opts?: object) => string | null };
            };
            type WindowWithLuxon = typeof window & { luxon?: { DateTime?: LuxonDateTime } };
            const { DateTime } = (window as WindowWithLuxon).luxon || {};
            if (DateTime) {
                const dt = DateTime.fromJSDate(new Date(typeof val === 'string' || typeof val === 'number' || val instanceof Date ? val : ''));
                return dt.isValid ? dt.toISO({ suppressMilliseconds: true }) : null;
            }
            const d = new Date(typeof val === 'string' || typeof val === 'number' || val instanceof Date ? val : '');
            return isNaN(d.getTime()) ? null : d.toISOString();
        }
        case "time": {
            type LuxonDateTime = {
                fromJSDate: (date: Date) => { isValid: boolean; toFormat: (fmt: string) => string; toISO: (opts?: object) => string | null };
            };
            type WindowWithLuxon = typeof window & { luxon?: { DateTime?: LuxonDateTime } };
            const { DateTime } = (window as WindowWithLuxon).luxon || {};
            if (DateTime) {
                const dt = DateTime.fromJSDate(new Date(typeof val === 'string' || typeof val === 'number' || val instanceof Date ? val : ''));
                return dt.isValid ? dt.toFormat("HH:mm:ss") : null;
            }
            const d = new Date(typeof val === 'string' || typeof val === 'number' || val instanceof Date ? val : '');
            return isNaN(d.getTime()) ? null : d.toISOString().slice(11, 19);
        }
        default:
            return null;
    }
}
