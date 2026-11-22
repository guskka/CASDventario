import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';

import { DataTable } from '../user-management/data-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

// Lista de chamada de um material: cada linha é um aluno ativo. A caixinha
// marcada = o aluno já recebeu (marcar registra a entrega; desmarcar pede
// confirmação). As ações vêm da seção (entregas-section.jsx).

const columnHelper = createColumnHelper();

function criarColunas({ salvando, esgotado, aoMarcar, aoDesmarcar }) {
  return columnHelper.columns([
    columnHelper.display({
      id: 'recebeu',
      meta: { className: 'w-12' },
      cell: ({ row }) => {
        const aluno = row.original;
        const recebeu = Boolean(aluno.entrega);
        return (
          <Checkbox
            checked={recebeu}
            disabled={salvando.has(aluno.rm_aluno) || (!recebeu && esgotado)}
            onCheckedChange={(marcado) => (marcado ? aoMarcar(aluno) : aoDesmarcar(aluno))}
            aria-label={
              recebeu
                ? `Desfazer a entrega de ${aluno.nome_completo}`
                : `Registrar a entrega para ${aluno.nome_completo}`
            }
          />
        );
      },
    }),

    columnHelper.accessor('nome_completo', {
      id: 'aluno',
      header: 'Aluno',
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    }),

    columnHelper.display({
      id: 'situacao',
      header: 'Situação',
      meta: { className: 'w-32' },
      cell: ({ row }) =>
        row.original.entrega ? (
          <Badge>Recebido</Badge>
        ) : (
          <Badge variant="outline">Pendente</Badge>
        ),
    }),

    columnHelper.accessor('rm_aluno', {
      header: 'RM',
      meta: { className: 'w-28' },
    }),

    columnHelper.accessor('turma', {
      header: 'Turma',
      meta: { className: 'w-20' },
      cell: ({ getValue }) => getValue() ?? '—',
    }),

    columnHelper.accessor('email', {
      header: 'Email',
    }),

    columnHelper.display({
      id: 'entregue_em',
      header: 'Entregue em',
      meta: { className: 'w-52' },
      cell: ({ row }) => {
        const entrega = row.original.entrega;
        if (!entrega) {
          return <span className="text-muted-foreground">—</span>;
        }
        return (
          <span>
            {new Date(entrega.data_entrega_kit).toLocaleDateString('pt-BR')}{' '}
            <span className="text-xs text-muted-foreground">por {entrega.registrado_por}</span>
          </span>
        );
      },
    }),
  ]);
}

const SEM_ORDEM = [];
const nadaAFazer = () => {};

export default function EntregasDataTable({ alunos, salvando, esgotado, aoMarcar, aoDesmarcar }) {
  const colunas = useMemo(
    () => criarColunas({ salvando, esgotado, aoMarcar, aoDesmarcar }),
    [salvando, esgotado, aoMarcar, aoDesmarcar],
  );

  return (
    <DataTable
      columns={colunas}
      data={alunos}
      pageSize={50}
      chaveLinhas="entregas"
      filterColumn="aluno"
      sorting={SEM_ORDEM}
      onSortingChange={nadaAFazer}
      manterPagina
    />
  );
}
