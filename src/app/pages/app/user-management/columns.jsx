'use client';

import { createColumnHelper } from '@tanstack/react-table';

import { DataTable } from './data-table';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { ArrowsDownUpIcon } from '@phosphor-icons/react';

import EditAdminDialog from './components/edit-admin-dialog';

const columnHelper = createColumnHelper();

export const columns = columnHelper.columns([
  columnHelper.accessor('id', {
    header: 'ID',

    meta: { className: 'w-15' },
  }),

  columnHelper.accessor('name', {
    header: 'Nome',

    cell: ({ getValue }) => {
      const name = getValue();

      const avatarUrl = `https://api.dicebear.com/10.x/shadows/svg?seed=${encodeURIComponent(
        name
      )}`;

      return (
        <div className="flex items-center gap-4">
          <img
            className="w-8 h-8 rounded-full"
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

    cell: ({ row }) => {
      const variantMap = {
        ATIVO: "default",
        PENDENTE: "outline",
        INATIVO: "destructive"
      }

      return (
        <Badge variant={variantMap[row.original.status]}>{row.original.status}</Badge>
      )
    }
  }),

  columnHelper.accessor('role', {
    header: 'Tipo',
  }),

  columnHelper.accessor('email', {
    header: 'Email'
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

export default function UsersDataTable({ users, filterValue, sorting, onSortingChange }) {
  return (
    <DataTable
      columns={columns}
      data={users}
      pageSize={5}
      filterValue={filterValue}
      sorting={sorting}
      onSortingChange={onSortingChange}
    />
  );
}
