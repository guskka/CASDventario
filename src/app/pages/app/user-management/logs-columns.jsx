import { createColumnHelper } from '@tanstack/react-table';
import { EyeIcon } from '@phosphor-icons/react';

import { DataTable } from './data-table';
import { Badge } from '@/components/ui/badge';
import { ACOES } from './log-textos';

// Colunas da aba "Logs" (histórico de alterações), no mesmo modelo de columns.jsx.
// Clicar numa linha abre a janela de detalhes (components/log-detalhes-dialog.jsx).

const columnHelper = createColumnHelper();

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

  // Mensagem curta; os detalhes completos ficam na janela. A busca procura
  // aqui (quem fez + descrição).
  columnHelper.accessor((log) => `${log.nome_usuario} ${log.descricao}`, {
    id: 'resumo',
    header: 'O que aconteceu',
    cell: ({ row }) => row.original.descricao,
  }),

  columnHelper.display({
    id: 'ver',
    meta: { className: 'w-12' },
    cell: () => (
      <EyeIcon className="text-muted-foreground" aria-label="Ver detalhes" />
    ),
  }),
]);

export default function LogsDataTable({ logs, filterValue, sorting, onSortingChange, onRowClick }) {
  return (
    <DataTable
      columns={logsColumns}
      data={logs}
      pageSize={10}
      filterValue={filterValue}
      filterColumn="resumo"
      sorting={sorting}
      onSortingChange={onSortingChange}
      onRowClick={onRowClick}
    />
  );
}
