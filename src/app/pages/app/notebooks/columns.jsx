import { createColumnHelper } from '@tanstack/react-table';

import { DataTable } from '../user-management/data-table';
import { Badge } from '@/components/ui/badge';
import NotebookDialog from './components/notebook-dialog';
import InativarNotebookDialog from './components/inativar-notebook-dialog';
import ReativarNotebookDialog from './components/reativar-notebook-dialog';
import { VARIANTE_STATUS, descreverVideo, rotuloMotivo, rotuloStatus } from './notebooks-textos';

// Colunas da lista de notebooks, no mesmo modelo de alunos/columns.jsx.

const columnHelper = createColumnHelper();

const notebooksColumns = columnHelper.columns([
  // Larguras fixas só nas colunas curtas: o resto do espaço fica para Modelo,
  // Processador, Vídeo e Sistema (em tela estreita, eles cortam com "...").
  columnHelper.accessor('id_notebook', {
    header: 'Nº',
    meta: { className: 'w-14' },
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
  }),

  columnHelper.accessor('status', {
    header: 'Status',
    meta: { className: 'w-48' },
    // Inativo: etiqueta curta "Inativo" + o motivo ao lado (cortado com "..."
    // se não couber; a dica mostra o texto inteiro).
    cell: ({ row, getValue }) =>
      getValue() === 'INATIVO' ? (
        <div className="flex min-w-0 items-center gap-2">
          <Badge variant={VARIANTE_STATUS.INATIVO}>Inativo</Badge>
          <span className="truncate text-xs text-muted-foreground">
            {rotuloMotivo(row.original.motivo_inativacao)}
          </span>
        </div>
      ) : (
        <Badge variant={VARIANTE_STATUS[getValue()]}>{rotuloStatus(getValue())}</Badge>
      ),
  }),

  columnHelper.display({
    id: 'acoes',
    meta: { className: 'w-20' },
    cell: ({ row }) => (
      <div className="flex">
        <NotebookDialog notebook={row.original} />
        {/* "Inativar" no lugar de "Excluir" (a janela de excluir fica para a 16c). */}
        {row.original.status === 'INATIVO' ? (
          <ReativarNotebookDialog notebook={row.original} />
        ) : (
          <InativarNotebookDialog notebook={row.original} />
        )}
      </div>
    ),
  }),
]);

export default function NotebooksDataTable({ notebooks, filterValue, sorting, onSortingChange }) {
  return (
    <DataTable
      columns={notebooksColumns}
      data={notebooks}
      chaveLinhas="notebooks"
      filterValue={filterValue}
      filterColumn="modelo"
      sorting={sorting}
      onSortingChange={onSortingChange}
    />
  );
}
