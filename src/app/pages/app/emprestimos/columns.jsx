import { createColumnHelper } from '@tanstack/react-table';

import { DataTable } from '../user-management/data-table';
import { Badge } from '@/components/ui/badge';
import PrazoDialog from './components/prazo-dialog';
import DesfazerEmprestimoDialog from './components/desfazer-emprestimo-dialog';
import DevolucaoDialog from './components/devolucao-dialog';
import DesfazerDevolucaoDialog from './components/desfazer-devolucao-dialog';
import { formatarDataSemHora } from '../remessas/remessas-textos';
import { situacao } from './emprestimos-textos';

// Colunas da lista de empréstimos. Clicar na linha abre os detalhes (checklist).

const columnHelper = createColumnHelper();

const emprestimosColumns = columnHelper.columns([
  columnHelper.accessor('id_emprestimo_notebook', {
    header: 'Nº',
    meta: { className: 'w-16' },
  }),

  // A busca procura aqui: aluno + RM + notebook.
  columnHelper.accessor(
    (e) => `${e.aluno} ${e.rm_aluno} ${e.notebook} nº ${e.id_notebook}`,
    {
      id: 'aluno',
      header: 'Aluno',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.aluno}</p>
          <p className="text-xs text-muted-foreground">RM {row.original.rm_aluno}</p>
        </div>
      ),
    },
  ),

  columnHelper.accessor('notebook', {
    header: 'Notebook',
    cell: ({ row }) => `nº ${row.original.id_notebook} · ${row.original.notebook}`,
  }),

  columnHelper.accessor('data_entrega', {
    header: 'Emprestado em',
    meta: { className: 'w-36' },
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString('pt-BR'),
  }),

  columnHelper.accessor('previsao_devolucao', {
    header: 'Devolver até',
    meta: { className: 'w-32' },
    cell: ({ getValue }) => formatarDataSemHora(getValue()),
  }),

  columnHelper.accessor('situacao', {
    header: 'Situação',
    meta: { className: 'w-32' },
    cell: ({ getValue }) => {
      const sit = situacao(getValue());
      return <Badge variant={sit.variant}>{sit.label}</Badge>;
    },
  }),

  columnHelper.display({
    id: 'acoes',
    meta: { className: 'w-32' },
    // stopPropagation: clicar nos botões (ou nas janelas deles) não abre os detalhes.
    cell: ({ row }) => (
      <div className="flex" onClick={(e) => e.stopPropagation()}>
        {row.original.situacao === 'DEVOLVIDO' ? (
          <DesfazerDevolucaoDialog emprestimo={row.original} />
        ) : (
          <>
            <DevolucaoDialog emprestimo={row.original} />
            <PrazoDialog emprestimo={row.original} />
            <DesfazerEmprestimoDialog emprestimo={row.original} />
          </>
        )}
      </div>
    ),
  }),
]);

export default function EmprestimosDataTable({
  emprestimos,
  filterValue,
  sorting,
  onSortingChange,
  onRowClick,
}) {
  return (
    <DataTable
      columns={emprestimosColumns}
      data={emprestimos}
      pageSize={10}
      filterValue={filterValue}
      filterColumn="aluno"
      sorting={sorting}
      onSortingChange={onSortingChange}
      onRowClick={onRowClick}
    />
  );
}
