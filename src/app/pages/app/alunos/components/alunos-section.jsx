import { useEffect, useMemo, useState } from 'react';

import { MagnifyingGlassIcon } from '@phosphor-icons/react';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';

import BotaoDirecaoOrdem from '@/components/botao-direcao-ordem';
import FiltroSelect from '@/components/filtro-select';
import AlunosDataTable from '../columns';
import { listarAlunos } from '@/lib/api';
import { ALUNOS_ALTERADOS } from '@/lib/eventos';
import { CURSOS, SEM_TURMA, STATUS_ALUNO, TURMAS } from '../alunos-textos';

// Lista de alunos: mesmo modelo da lista de administradores
// (components/table-section.jsx), com filtros de curso, turma e status.

const ORDER_BY = [
  { label: 'Nome', value: 'nome' },
  { label: 'RM', value: 'rm_aluno' },
  { label: 'Turma', value: 'turma' },
  { label: 'Curso', value: 'curso' },
  { label: 'Status', value: 'status' },
];

const TODOS = 'TODOS';
const FILTRO_CURSO = [{ label: 'Todos os cursos', value: TODOS }, ...CURSOS];
const FILTRO_TURMA = [{ label: 'Todas as turmas', value: TODOS }, ...TURMAS];
const FILTRO_STATUS = [{ label: 'Todos os status', value: TODOS }, ...STATUS_ALUNO];

export default function AlunosSection() {
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState('');
  const [sorted, setSorted] = useState([{ id: 'nome', desc: false }]);
  const [curso, setCurso] = useState(TODOS);
  const [turma, setTurma] = useState(TODOS);
  const [status, setStatus] = useState(TODOS);
  const [erro, setErro] = useState('');

  useEffect(() => {
    function carregar() {
      listarAlunos()
        .then((data) => {
          setAlunos(data);
          setErro('');
        })
        .catch((error) => setErro(error.message));
    }

    carregar();

    // Recarrega depois de cadastrar, editar ou excluir um aluno.
    window.addEventListener(ALUNOS_ALTERADOS, carregar);
    return () => window.removeEventListener(ALUNOS_ALTERADOS, carregar);
  }, []);

  // Aplica os filtros de curso, turma e status (a busca por texto é da tabela).
  const alunosFiltrados = useMemo(
    () =>
      alunos.filter(
        (aluno) =>
          (curso === TODOS || aluno.curso === curso) &&
          (turma === TODOS || (aluno.turma ?? SEM_TURMA) === turma) &&
          (status === TODOS || aluno.status === status),
      ),
    [alunos, curso, turma, status],
  );

  const handleOrderByChange = (columnId) => {
    if (columnId) {
      setSorted(([atual]) => [{ id: columnId, desc: atual?.desc ?? false }]);
    }
  };
  const inverterOrdem = () => setSorted(([atual]) => [{ id: atual.id, desc: !atual.desc }]);

  return (
    <div className="rounded-md border-2">
      <div className="flex items-center justify-between rounded-t-md px-4 w-full h-16 bg-card">
        <h4 className="font-semibold text-lg">Alunos</h4>

        <div className="flex gap-2">
          <FiltroSelect
            items={ORDER_BY}
            value={sorted[0]?.id}
            onValueChange={handleOrderByChange}
            dica="Ordenar por"
          />
          <BotaoDirecaoOrdem desc={sorted[0]?.desc} onToggle={inverterOrdem} />
          <InputGroup className="ml-2">
            <InputGroupInput
              placeholder="Buscar por nome, RM ou email..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <InputGroupAddon>
              <MagnifyingGlassIcon />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>

      <div className="p-4 w-full space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtrar:</span>
          <FiltroSelect items={FILTRO_CURSO} value={curso} onValueChange={setCurso} dica="Curso" />
          <FiltroSelect items={FILTRO_TURMA} value={turma} onValueChange={setTurma} dica="Turma" />
          <FiltroSelect
            items={FILTRO_STATUS}
            value={status}
            onValueChange={setStatus}
            dica="Status"
          />
          <span className="ml-auto text-sm text-muted-foreground">
            {alunos.length} {alunos.length === 1 ? 'aluno cadastrado' : 'alunos cadastrados'}
          </span>
        </div>

        {erro && (
          <p className="text-sm text-destructive">Não foi possível carregar os alunos: {erro}</p>
        )}
        <AlunosDataTable
          alunos={alunosFiltrados}
          filterValue={busca}
          sorting={sorted}
          onSortingChange={setSorted}
        />
      </div>
    </div>
  );
}
