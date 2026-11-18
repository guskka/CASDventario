import { createColumnHelper } from '@tanstack/react-table';

import { DataTable } from '../user-management/data-table';
import DesfazerEntregaDialog from './components/desfazer-entrega-dialog';

// Colunas da lista de entregas de kits, no mesmo modelo das outras listas.

const columnHelper = createColumnHelper();

const entregasColumns = columnHelper.columns([
  columnHelper.accessor('id_entrega_kit', {
    header: 'Nº',
    meta: { className: 'w-16' },
  }),

  columnHelper.accessor('data_entrega_kit', {
    header: 'Data',
    meta: { className: 'w-32' },
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString('pt-BR'),
  }),

  // A busca procura aqui: aluno + RM + material.
  columnHelper.accessor((e) => `${e.aluno} ${e.rm_aluno} ${e.material}`, {
    id: 'aluno',
    header: 'Aluno',
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.aluno}</p>
        <p className="text-xs text-muted-foreground">RM {row.original.rm_aluno}</p>
      </div>
    ),
  }),

  columnHelper.accessor('material', {
    header: 'Material',
  }),

  columnHelper.accessor('qtd_entregue', {
    header: 'Qtd.',
    meta: { className: 'w-20' },
  }),

  columnHelper.accessor('registrado_por', {
    header: 'Registrado por',
    meta: { className: 'w-48' },
  }),

  columnHelper.display({
    id: 'acoes',
    meta: { className: 'w-16' },
    cell: ({ row }) => <DesfazerEntregaDialog entrega={row.original} />,
  }),
]);

export default function EntregasDataTable({ entregas, filterValue, sorting, onSortingChange }) {
  return (
    <DataTable
      columns={entregasColumns}
      data={entregas}
      pageSize={10}
      filterValue={filterValue}
      filterColumn="aluno"
      sorting={sorting}
      onSortingChange={onSortingChange}
    />
  );
}
