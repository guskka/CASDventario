'use client';

import { createColumnHelper } from '@tanstack/react-table';

import { DataTable } from './data-table';

import { Button } from '@/components/ui/button';

import { ArrowsDownUpIcon } from '@phosphor-icons/react';

import EditAdminDialog from './components/edit-admin-dialog';

const columnHelper = createColumnHelper();

export const columns = columnHelper.columns([
  columnHelper.accessor('id_usuario', {
    header: 'ID',

    meta: { className: 'w-15' },
  }),

  columnHelper.accessor('nome_completo', {
    header: 'Nome',

    cell: ({ getValue }) => {
      const name = getValue();

      const avatarUrl = `https://api.dicebear.com/10.x/micah/svg?seed=${encodeURIComponent(
        name
      )}`;

      return (
        <div className="flex items-center gap-2">
          <img
            className="w-10 h-10"
            src={avatarUrl}
            alt={`Avatar de ${name}`}
          />

          <p>{name}</p>
        </div>
      );
    },
  }),

  columnHelper.accessor('username', {
    header: 'Apelido',
  }),

  columnHelper.accessor('status', {
    header: 'Status',
  }),

  columnHelper.accessor('role', {
    header: 'Tipo',
  }),

  columnHelper.accessor('email', {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="font-semibold"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === 'asc')
          }
        >
          Email
          <ArrowsDownUpIcon />
        </Button>
      );
    },
  }),

  columnHelper.display({
    id: 'actions',

    meta: {
      className: 'w-15',
    },

    cell: ({ row }) => {
      return (
        <div>
          <EditAdminDialog user={row.original} />
        </div>
      );
    },
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