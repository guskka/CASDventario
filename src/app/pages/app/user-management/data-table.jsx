'use client';

import * as React from 'react';
import { useTable } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { features } from './data-table-features';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

export function DataTable({ columns, data, pageSize = 10, filterValue = '' }) {
  const [sorting, setSorting] = React.useState([]);

  const table = useTable({
    features,
    data,
    columns,
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  React.useEffect(() => {
    table.getColumn('name')?.setFilterValue(filterValue);
  }, [filterValue, table]);

  return (
    <div className='flex flex-col gap-4'>
      <div className="overflow-hidden rounded-md border">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-card">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const customClass =
                    header.column.columnDef.meta?.className || '';
                  return (
                    <TableHead
                      className={`font-bold select-none ${customClass}`}
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => {
                    const customClass =
                      cell.column.columnDef.meta?.className || '';
                    return (
                      <TableCell
                        className={`truncate min-w-0 ${customClass}`}
                        key={cell.id}
                      >
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sem resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size='icon'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <CaretLeftIcon />
        </Button>
        <p>
          Página {table.state.pagination.pageIndex + 1} de{' '}
          {table.getPageCount()}
        </p>
        <Button
          variant="ghost"
          size='icon'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <CaretRightIcon />
        </Button>
      </div>
    </div>
  );
}
