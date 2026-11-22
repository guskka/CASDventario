import { createColumnHelper } from '@tanstack/react-table';

import { DataTable } from '../user-management/data-table';
import { Badge } from '@/components/ui/badge';
import AlunoDialog from './components/aluno-dialog';
import ExcluirAlunoDialog from './components/excluir-aluno-dialog';
import { CURSOS, STATUS_ALUNO, VARIANTE_STATUS, rotulo } from './alunos-textos';

// Colunas da lista de alunos, no mesmo modelo de user-management/columns.jsx.

const columnHelper = createColumnHelper();

const alunosColumns = columnHelper.columns([
  columnHelper.accessor('rm_aluno', {
    header: 'RM',
    meta: { className: 'w-28' },
  }),

  // A busca procura aqui: nome + RM + email. A célula mostra só o nome.
  columnHelper.accessor((aluno) => `${aluno.nome_completo} ${aluno.rm_aluno} ${aluno.email}`, {
    id: 'nome',
    header: 'Nome',
    cell: ({ row }) => {
      const nome = row.original.nome_completo;
      const avatarUrl = `https://api.dicebear.com/10.x/shadows/svg?seed=${encodeURIComponent(nome)}`;
      return (
        <div className="flex items-center gap-4">
          <img className="w-8 h-8 rounded-full" src={avatarUrl} alt={`Avatar de ${nome}`} />
          <p className="truncate">{nome}</p>
        </div>
      );
    },
  }),

  columnHelper.accessor('email', {
    header: 'Email',
  }),

  // Aluno sem turma (null no banco) vira texto vazio para ordenar sem erro.
  columnHelper.accessor((aluno) => aluno.turma ?? '', {
    id: 'turma',
    header: 'Turma',
    meta: { className: 'w-24' },
    cell: ({ getValue }) => getValue() || '—',
  }),

  columnHelper.accessor('curso', {
    header: 'Curso',
    meta: { className: 'w-36' },
    cell: ({ getValue }) => rotulo(CURSOS, getValue()),
  }),

  columnHelper.accessor('status', {
    header: 'Status',
    meta: { className: 'w-28' },
    cell: ({ getValue }) => (
      <Badge variant={VARIANTE_STATUS[getValue()]}>{rotulo(STATUS_ALUNO, getValue())}</Badge>
    ),
  }),

  columnHelper.display({
    id: 'acoes',
    meta: { className: 'w-24' },
    cell: ({ row }) => (
      <div className="flex">
        <AlunoDialog aluno={row.original} />
        <ExcluirAlunoDialog aluno={row.original} />
      </div>
    ),
  }),
]);

export default function AlunosDataTable({ alunos, filterValue, sorting, onSortingChange }) {
  return (
    <DataTable
      columns={alunosColumns}
      data={alunos}
      chaveLinhas="alunos"
      filterValue={filterValue}
      filterColumn="nome"
      sorting={sorting}
      onSortingChange={onSortingChange}
    />
  );
}
