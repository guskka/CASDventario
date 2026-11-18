'use client';

import { createColumnHelper } from '@tanstack/react-table';

import { DataTable } from './data-table';

import { Badge } from '@/components/ui/badge';

import EditAdminDialog from './components/edit-admin-dialog';
import { urlAvatar } from '@/lib/avatar';

const columnHelper = createColumnHelper();

const columns = columnHelper.columns([
  columnHelper.accessor('id', {
    header: 'ID',

    meta: { className: 'w-15' },
  }),

  columnHelper.accessor('name', {
    header: 'Nome',

    cell: ({ getValue, row }) => {
      const name = getValue();

      // Foto de perfil, se a pessoa enviou uma; senão, o avatar automático.
      const avatarUrl = urlAvatar(name, row.original.foto);

      return (
        <div className="flex items-center gap-4">
          <img
            className="w-8 h-8 rounded-full object-cover"
            src={avatarUrl}
            alt={`Avatar de ${name}`}
          />

          <p>{name}</p>
        </div>
      );
    },
  }),

  columnHelper.accessor('email', {
    header: 'Email',
  }),

  columnHelper.accessor('status', {
    header: 'Status',

    meta: { className: 'w-1/8' },

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
    header: 'Cargo',

    meta: { className: 'w-1/8' },
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
