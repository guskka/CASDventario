import { createColumnHelper } from '@tanstack/react-table';

import { DataTable } from '../user-management/data-table';
import { Badge } from '@/components/ui/badge';
import NotebookDialog from './components/notebook-dialog';
import ExcluirNotebookDialog from './components/excluir-notebook-dialog';
import { VARIANTE_STATUS, descreverVideo, rotuloStatus } from './notebooks-textos';

// Colunas da lista de notebooks, no mesmo modelo de alunos/columns.jsx.

const columnHelper = createColumnHelper();

const notebooksColumns = columnHelper.columns([
  columnHelper.accessor('id_notebook', {
    header: 'Nº',
    meta: { className: 'w-16' },
  }),

  // A busca procura aqui: modelo + processador + vídeo + sistema + nº.
  columnHelper.accessor(
    (nb) =>
      `${nb.modelo} ${nb.processador} ${nb.placa_grafica} ${nb.sistema_operacional} ${nb.id_notebook}`,
    {
      id: 'modelo',
      header: 'Modelo',
      cell: ({ row }) => <span className="font-medium">{row.original.modelo}</span>,
    },
  ),

  columnHelper.accessor('processador', {
    header: 'Processador',
  }),

  columnHelper.accessor('memoria_ram_gb', {
    header: 'RAM',
    meta: { className: 'w-20' },
    cell: ({ getValue }) => `${getValue()} GB`,
  }),

  columnHelper.accessor('armazenamento_gb', {
    header: 'Armazen.',
    meta: { className: 'w-24' },
    cell: ({ getValue }) => `${getValue()} GB`,
  }),

  columnHelper.accessor((nb) => descreverVideo(nb), {
    id: 'video',
    header: 'Vídeo',
  }),

  columnHelper.accessor('sistema_operacional', {
    header: 'Sistema',
    meta: { className: 'w-36' },
  }),

  columnHelper.accessor('status', {
    header: 'Status',
    meta: { className: 'w-52' },
    cell: ({ getValue }) => (
      <Badge variant={VARIANTE_STATUS[getValue()]}>{rotuloStatus(getValue())}</Badge>
    ),
  }),

  columnHelper.display({
    id: 'acoes',
    meta: { className: 'w-24' },
    cell: ({ row }) => (
      <div className="flex">
        <NotebookDialog notebook={row.original} />
        <ExcluirNotebookDialog notebook={row.original} />
      </div>
    ),
  }),
]);

export default function NotebooksDataTable({ notebooks, filterValue, sorting, onSortingChange }) {
  return (
    <DataTable
      columns={notebooksColumns}
      data={notebooks}
      pageSize={10}
      filterValue={filterValue}
      filterColumn="modelo"
      sorting={sorting}
      onSortingChange={onSortingChange}
    />
  );
}
