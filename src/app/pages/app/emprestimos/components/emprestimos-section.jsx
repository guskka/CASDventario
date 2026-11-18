import { useEffect, useMemo, useState } from 'react';

import { MagnifyingGlassIcon } from '@phosphor-icons/react';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import BotaoDirecaoOrdem from '@/components/botao-direcao-ordem';
import FiltroSelect from '@/components/filtro-select';
import EmprestimosDataTable from '../columns';
import EmprestimoDetalhesDialog from './emprestimo-detalhes-dialog';
import { listarEmprestimos } from '@/lib/api';
import { EMPRESTIMOS_ALTERADOS } from '@/lib/eventos';
import { SITUACOES } from '../emprestimos-textos';

// Lista de empréstimos de notebook: mesmo modelo das outras listas.

const ORDER_BY = [
  { label: 'Emprestado em', value: 'data_entrega' },
  { label: 'Devolver até', value: 'previsao_devolucao' },
  { label: 'Aluno', value: 'aluno' },
];

const TODAS = 'TODAS';
const FILTRO_SITUACAO = [
  { label: 'Todas as situações', value: TODAS },
  ...SITUACOES.map(({ label, value }) => ({ label, value })),
];

export default function EmprestimosSection() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [busca, setBusca] = useState('');
  const [sorted, setSorted] = useState([{ id: 'data_entrega', desc: true }]);
  const [filtroSituacao, setFiltroSituacao] = useState(TODAS);
  const [aberto, setAberto] = useState(null); // empréstimo clicado (detalhes)
  const [erro, setErro] = useState('');

  useEffect(() => {
    function carregar() {
      listarEmprestimos()
        .then((data) => {
          setEmprestimos(data);
          setErro('');
        })
        .catch((error) => setErro(error.message));
    }

    carregar();
    window.addEventListener(EMPRESTIMOS_ALTERADOS, carregar);
    return () => window.removeEventListener(EMPRESTIMOS_ALTERADOS, carregar);
  }, []);

  const filtrados = useMemo(
    () => emprestimos.filter((e) => filtroSituacao === TODAS || e.situacao === filtroSituacao),
    [emprestimos, filtroSituacao],
  );

  const contar = (valor) => emprestimos.filter((e) => e.situacao === valor).length;

  const handleOrderByChange = (columnId) => {
    if (columnId) {
      setSorted(([atual]) => [{ id: columnId, desc: atual?.desc ?? false }]);
    }
  };
  const inverterOrdem = () => setSorted(([atual]) => [{ id: atual.id, desc: !atual.desc }]);

  return (
    <div className="rounded-md border-2">
      <div className="flex items-center justify-between rounded-t-md px-4 w-full h-16 bg-card">
        <h4 className="font-semibold text-lg">Empréstimos</h4>

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
              placeholder="Buscar por aluno, RM ou notebook..."
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
          <FiltroSelect
            items={FILTRO_SITUACAO}
            value={filtroSituacao}
            onValueChange={setFiltroSituacao}
            dica="Situação"
          />
          <span className="ml-auto text-sm text-muted-foreground">
            {contar('EM_ANDAMENTO')} em andamento · {contar('ATRASADO')} atrasado(s) ·{' '}
            {contar('DEVOLVIDO')} devolvido(s)
          </span>
        </div>

        {erro && (
          <p className="text-sm text-destructive">
            Não foi possível carregar os empréstimos: {erro}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Clique num empréstimo para ver o checklist do notebook.
        </p>
        <EmprestimosDataTable
          emprestimos={filtrados}
          filterValue={busca}
          sorting={sorted}
          onSortingChange={setSorted}
          onRowClick={setAberto}
        />
      </div>
      <EmprestimoDetalhesDialog emprestimo={aberto} onFechar={() => setAberto(null)} />
    </div>
  );
}
