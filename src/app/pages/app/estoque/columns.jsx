import { createColumnHelper } from '@tanstack/react-table';

import { DataTable } from '../user-management/data-table';
import { Badge } from '@/components/ui/badge';
import { rotuloOrigem, rotuloVolume } from '../remessas/remessas-textos';

// Colunas da tela Estoque: um total por material (tipo + volume + ano).
// Só leitura: o estoque muda pelas remessas e pelas entregas de kits.

const columnHelper = createColumnHelper();

const estoqueColumns = columnHelper.columns([
  // A busca procura aqui (nome do material, com volume e ano).
  columnHelper.accessor('nome', {
    header: 'Material',
    cell: ({ row }) => <span className="font-medium">{row.original.material}</span>,
  }),

  columnHelper.accessor((g) => g.volume_material ?? '', {
    id: 'volume',
    header: 'Volume',
    meta: { className: 'w-24' },
    cell: ({ row }) => rotuloVolume(row.original.volume_material),
  }),

  columnHelper.accessor('ano_letivo_material', {
    header: 'Ano letivo',
    meta: { className: 'w-28' },
  }),

  columnHelper.accessor('qtd_recebida', {
    header: 'Recebidos',
    meta: { className: 'w-28' },
  }),

  columnHelper.accessor('qtd_entregue', {
    header: 'Entregues',
    meta: { className: 'w-28' },
  }),

  columnHelper.accessor('qtd_disponivel', {
    header: 'Disponíveis',
    meta: { className: 'w-32' },
    cell: ({ getValue }) =>
      getValue() > 0 ? (
        <Badge>{getValue()}</Badge>
      ) : (
        <Badge variant="destructive">Esgotado</Badge>
      ),
  }),

  columnHelper.accessor('remessas', {
    header: 'Remessas',
    meta: { className: 'w-44' },
    cell: ({ row }) =>
      `${row.original.remessas} (${row.original.origens.map(rotuloOrigem).join(', ')})`,
  }),
]);

export default function EstoqueDataTable({ grupos, filterValue, sorting, onSortingChange }) {
  return (
    <DataTable
      columns={estoqueColumns}
      data={grupos}
      pageSize={10}
      filterValue={filterValue}
      filterColumn="nome"
      sorting={sorting}
      onSortingChange={onSortingChange}
    />
  );
}
