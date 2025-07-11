import React from 'react';
import { cn } from '../lib/utils';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> { }

export const Table: React.FC<TableProps> = ({ className, ...props }) => (
    <div className="relative w-full overflow-auto">
        <table
            className={cn('w-full caption-bottom text-sm', className)}
            {...props}
        />
    </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
    className,
    ...props
}) => <thead className={cn('[&_tr]:border-b', className)} {...props} />;

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
    className,
    ...props
}) => (
    <tbody
        className={cn('[&_tr:last-child]:border-0', className)}
        {...props}
    />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
    className,
    ...props
}) => (
    <tr
        className={cn(
            'border-b transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-50',
            className
        )}
        {...props}
    />
);

export const TableHead: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = ({
    className,
    ...props
}) => (
    <th
        className={cn(
            'h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0',
            className
        )}
        {...props}
    />
);

export const TableCell: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = ({
    className,
    ...props
}) => (
    <td
        className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
        {...props}
    />
);
