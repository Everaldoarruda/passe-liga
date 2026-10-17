import type { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => number;
  loading: boolean;
  error: string | null;
  emptyMessage: string;
}

function DataTable<T>({ columns, rows, rowKey, loading, error, emptyMessage }: DataTableProps<T>) {
  const alignClass = (column: Column<T>) => (column.align === 'right' ? 'text-right' : 'text-left');

  const renderBody = () => {
    if (loading) return <StatusRow colSpan={columns.length}>Carregando...</StatusRow>;
    if (error)
      return (
        <StatusRow colSpan={columns.length} className="text-red-600">
          {error}
        </StatusRow>
      );
    if (rows.length === 0) return <StatusRow colSpan={columns.length}>{emptyMessage}</StatusRow>;
    return rows.map((row) => (
      <tr key={rowKey(row)} className="border-b border-gray-100 last:border-0">
        {columns.map((column) => (
          <td key={column.header} className={`px-3 py-2 ${alignClass(column)}`}>
            {column.render(row)}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs text-gray-500">
            {columns.map((column) => (
              <th key={column.header} className={`px-3 py-2 font-medium ${alignClass(column)}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderBody()}</tbody>
      </table>
    </div>
  );
}

interface StatusRowProps {
  colSpan: number;
  className?: string;
  children: ReactNode;
}

function StatusRow({ colSpan, className = 'text-gray-500', children }: StatusRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className={`px-3 py-8 text-center ${className}`}>
        {children}
      </td>
    </tr>
  );
}

export default DataTable;
