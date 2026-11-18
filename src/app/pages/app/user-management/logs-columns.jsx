import { createColumnHelper } from '@tanstack/react-table';

import { DataTable } from './data-table';
import { Badge } from '@/components/ui/badge';

// Colunas da aba "Logs" (histórico de alterações), no mesmo modelo de columns.jsx.

const columnHelper = createColumnHelper();

const ACOES = {
  CRIOU: { label: 'Criou', variant: 'default' },
  EDITOU: { label: 'Editou', variant: 'secondary' },
  EXCLUIU: { label: 'Excluiu', variant: 'destructive' },
  REENVIOU_CONVITE: { label: 'Reenviou convite', variant: 'outline' },
};

const logsColumns = columnHelper.columns([
  columnHelper.accessor('criado_em', {
    header: 'Data e hora',
    meta: { className: 'w-44' },
    cell: ({ getValue }) => new Date(getValue()).toLocaleString('pt-BR'),
  }),

  columnHelper.accessor('nome_usuario', {
    header: 'Quem',
    meta: { className: 'w-1/5' },
    cell: ({ getValue }) => {
      const nome = getValue();
      const avatarUrl = `https://api.dicebear.com/10.x/shadows/svg?seed=${encodeURIComponent(nome)}`;

      return (
        <div className="flex items-center gap-4">
          <img className="w-8 h-8 rounded-full" src={avatarUrl} alt={`Avatar de ${nome}`} />
          <p className="truncate">{nome}</p>
        </div>
      );
    },
  }),

  columnHelper.accessor('acao', {
    header: 'Ação',
    meta: { className: 'w-40' },
    cell: ({ getValue }) => {
      const acao = ACOES[getValue()] ?? { label: getValue(), variant: 'outline' };
      return <Badge variant={acao.variant}>{acao.label}</Badge>;
    },
  }),

  // A busca procura aqui: junta quem fez + a descrição.
  columnHelper.accessor((log) => `${log.nome_usuario} ${log.descricao}`, {
    id: 'resumo',
    header: 'O que aconteceu',
    cell: ({ row }) => <span title={row.original.descricao}>{row.original.descricao}</span>,
  }),
]);

export default function LogsDataTable({ logs, filterValue, sorting, onSortingChange }) {
  return (
    <DataTable
      columns={logsColumns}
      data={logs}
      pageSize={10}
      filterValue={filterValue}
      filterColumn="resumo"
      sorting={sorting}
      onSortingChange={onSortingChange}
    />
  );
}
