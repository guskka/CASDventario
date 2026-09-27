'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { DataTable } from './data-table';
import { Button } from '@/components/ui/button';
import { ArrowsDownUpIcon } from '@phosphor-icons/react';

const columnHelper = createColumnHelper();

export const columns = columnHelper.columns([
  columnHelper.accessor('id', {
    header: 'ID',
    meta: {
      className: 'w-20',
    },
  }),
  columnHelper.accessor('name', {
    header: 'Nome',
    cell: ({ row, getValue }) => {
      const name = getValue();
      const avatarUrl = `https://api.dicebear.com/10.x/lorelei/svg?seed=${encodeURIComponent(name)}`;

      return (
        <div className="flex items-center gap-2">
          <img className="w-10 h-10" src={avatarUrl} alt="Avatar" />
          <p>{name}</p>
        </div>
      );
    },
  }),
  columnHelper.accessor('email', {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowsDownUpIcon />
        </Button>
      );
    },
  }),
  columnHelper.accessor('company.name', {
    header: 'Empresa',
  }),
]);

export default function UsersDataTable({ users, filterValue }) {
  return (
    <DataTable
      columns={columns}
      data={users}
      pageSize={5}
      filterValue={filterValue}
    />
  );
}
