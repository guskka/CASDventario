import { createColumnHelper } from '@tanstack/react-table';

import { DataTable } from '../user-management/data-table';
import { Badge } from '@/components/ui/badge';
import RemessaDialog from './components/remessa-dialog';
import ExcluirRemessaDialog from './components/excluir-remessa-dialog';
import { formatarDataSemHora, rotuloOrigem } from './remessas-textos';

// Colunas da lista de remessas, no mesmo modelo de alunos/columns.jsx.

const columnHelper = createColumnHelper();

const remessasColumns = columnHelper.columns([
  columnHelper.accessor('id_remessa', {
    header: 'Nº',
    meta: { className: 'w-16' },
  }),

  columnHelper.accessor('data_recebimento', {
    header: 'Recebida em',
    meta: { className: 'w-32' },
    cell: ({ getValue }) => formatarDataSemHora(getValue()),
  }),

  columnHelper.accessor('origem', {
    header: 'Origem',
    meta: { className: 'w-28' },
    cell: ({ getValue }) => <Badge variant="outline">{rotuloOrigem(getValue())}</Badge>,
  }),

  // A busca procura aqui: descrição + materiais + nº.
  columnHelper.accessor(
    (r) => `${r.descricao ?? ''} ${r.materiais_resumo} ${r.id_remessa}`,
    {
      id: 'materiais',
      header: 'Materiais',
      cell: ({ row }) => (
        <div className="min-w-0" title={row.original.materiais_resumo}>
          {row.original.descricao && (
            <p className="truncate font-medium">{row.original.descricao}</p>
          )}
          <p className="truncate text-muted-foreground">
            {row.original.itens.length} material(is): {row.original.materiais_resumo}
          </p>
        </div>
      ),
    },
  ),

  columnHelper.accessor('total_recebido', {
    header: 'Recebidos',
    meta: { className: 'w-28' },
  }),

  columnHelper.accessor('total_disponivel', {
    header: 'Disponíveis',
    meta: { className: 'w-28' },
  }),

  columnHelper.display({
    id: 'acoes',
    meta: { className: 'w-24' },
    cell: ({ row }) => (
      <div className="flex">
        <RemessaDialog remessa={row.original} />
        <ExcluirRemessaDialog remessa={row.original} />
      </div>
    ),
  }),
]);

export default function RemessasDataTable({ remessas, filterValue, sorting, onSortingChange }) {
  return (
    <DataTable
      columns={remessasColumns}
      data={remessas}
      chaveLinhas="remessas"
      filterValue={filterValue}
      filterColumn="materiais"
      sorting={sorting}
      onSortingChange={onSortingChange}
    />
  );
}
