import { useEffect, useMemo, useState } from 'react';

import { MagnifyingGlassIcon } from '@phosphor-icons/react';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import BotaoDirecaoOrdem from '@/components/botao-direcao-ordem';
import FiltroSelect from '@/components/filtro-select';
import NotebooksDataTable from '../columns';
import { listarNotebooks } from '@/lib/api';
import { NOTEBOOKS_ALTERADOS } from '@/lib/eventos';
import { STATUS_NOTEBOOK } from '../notebooks-textos';

// Lista de notebooks: mesmo modelo da lista de alunos, com filtro de status.

const ORDER_BY = [
  { label: 'Nº', value: 'id_notebook' },
  { label: 'Modelo', value: 'modelo' },
  { label: 'RAM', value: 'memoria_ram_gb' },
  { label: 'Armazenamento', value: 'armazenamento_gb' },
  { label: 'Status', value: 'status' },
];

const TODOS = 'TODOS';
const FILTRO_STATUS = [{ label: 'Todos os status', value: TODOS }, ...STATUS_NOTEBOOK];

export default function NotebooksSection() {
  const [notebooks, setNotebooks] = useState([]);
  const [busca, setBusca] = useState('');
  const [sorted, setSorted] = useState([{ id: 'id_notebook', desc: false }]);
  const [status, setStatus] = useState(TODOS);
  const [erro, setErro] = useState('');

  useEffect(() => {
    function carregar() {
      listarNotebooks()
        .then((data) => {
          setNotebooks(data);
          setErro('');
        })
        .catch((error) => setErro(error.message));
    }

    carregar();

    // Recarrega depois de cadastrar, editar ou excluir um notebook.
    window.addEventListener(NOTEBOOKS_ALTERADOS, carregar);
    return () => window.removeEventListener(NOTEBOOKS_ALTERADOS, carregar);
  }, []);

  const notebooksFiltrados = useMemo(
    () => notebooks.filter((nb) => status === TODOS || nb.status === status),
    [notebooks, status],
  );

  // Resumo do topo: quantos há em cada status.
  const contagem = useMemo(() => {
    const porStatus = { DISPONIVEL: 0, INDISPONIVEL: 0, MANUTENCAO: 0 };
    notebooks.forEach((nb) => {
      porStatus[nb.status] = (porStatus[nb.status] ?? 0) + 1;
    });
    return porStatus;
  }, [notebooks]);

  const handleOrderByChange = (columnId) => {
    if (columnId) {
      setSorted(([atual]) => [{ id: columnId, desc: atual?.desc ?? false }]);
    }
  };
  const inverterOrdem = () => setSorted(([atual]) => [{ id: atual.id, desc: !atual.desc }]);

  return (
    <div className="rounded-md border-2">
      <div className="flex items-center justify-between rounded-t-md px-4 w-full h-16 bg-card">
        <h4 className="font-semibold text-lg">Notebooks</h4>

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
              placeholder="Buscar por modelo, processador..."
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
          <FiltroSelect items={FILTRO_STATUS} value={status} onValueChange={setStatus} dica="Status" />
          <span className="ml-auto text-sm text-muted-foreground">
            {notebooks.length} cadastrados · {contagem.DISPONIVEL} disponíveis ·{' '}
            {contagem.INDISPONIVEL} emprestados · {contagem.MANUTENCAO} em manutenção
          </span>
        </div>

        {erro && (
          <p className="text-sm text-destructive">Não foi possível carregar os notebooks: {erro}</p>
        )}
        <NotebooksDataTable
          notebooks={notebooksFiltrados}
          filterValue={busca}
          sorting={sorted}
          onSortingChange={setSorted}
        />
      </div>
    </div>
  );
}
