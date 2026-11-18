import { useEffect, useMemo, useState } from 'react';

import { MagnifyingGlassIcon } from '@phosphor-icons/react';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import BotaoDirecaoOrdem from '@/components/botao-direcao-ordem';
import FiltroSelect from '@/components/filtro-select';
import RemessasDataTable from '../columns';
import { listarRemessas } from '@/lib/api';
import { REMESSAS_ALTERADAS } from '@/lib/eventos';
import { ORIGENS } from '../remessas-textos';

// Lista de remessas: mesmo modelo das listas de Alunos e Notebooks.

const ORDER_BY = [
  { label: 'Data de recebimento', value: 'data_recebimento' },
  { label: 'Nº', value: 'id_remessa' },
  { label: 'Recebidos', value: 'total_recebido' },
  { label: 'Disponíveis', value: 'total_disponivel' },
];

const TODAS = 'TODAS';
const FILTRO_ORIGEM = [{ label: 'Todas as origens', value: TODAS }, ...ORIGENS];

export default function RemessasSection() {
  const [remessas, setRemessas] = useState([]);
  const [busca, setBusca] = useState('');
  const [sorted, setSorted] = useState([{ id: 'data_recebimento', desc: true }]);
  const [origem, setOrigem] = useState(TODAS);
  const [erro, setErro] = useState('');

  useEffect(() => {
    function carregar() {
      listarRemessas()
        .then((data) => {
          setRemessas(data);
          setErro('');
        })
        .catch((error) => setErro(error.message));
    }

    carregar();

    // Recarrega depois de registrar, editar ou excluir uma remessa.
    window.addEventListener(REMESSAS_ALTERADAS, carregar);
    return () => window.removeEventListener(REMESSAS_ALTERADAS, carregar);
  }, []);

  const remessasFiltradas = useMemo(
    () => remessas.filter((r) => origem === TODAS || r.origem === origem),
    [remessas, origem],
  );

  const totalDisponivel = remessas.reduce((soma, r) => soma + r.total_disponivel, 0);

  const handleOrderByChange = (columnId) => {
    if (columnId) {
      setSorted(([atual]) => [{ id: columnId, desc: atual?.desc ?? false }]);
    }
  };
  const inverterOrdem = () => setSorted(([atual]) => [{ id: atual.id, desc: !atual.desc }]);

  return (
    <div className="rounded-md border-2">
      <div className="flex items-center justify-between rounded-t-md px-4 w-full h-16 bg-card">
        <h4 className="font-semibold text-lg">Remessas</h4>

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
              placeholder="Buscar por material ou descrição..."
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
            items={FILTRO_ORIGEM}
            value={origem}
            onValueChange={setOrigem}
            dica="Origem"
          />
          <span className="ml-auto text-sm text-muted-foreground">
            {remessas.length} {remessas.length === 1 ? 'remessa' : 'remessas'} · {totalDisponivel}{' '}
            itens disponíveis no estoque
          </span>
        </div>

        {erro && (
          <p className="text-sm text-destructive">Não foi possível carregar as remessas: {erro}</p>
        )}
        <RemessasDataTable
          remessas={remessasFiltradas}
          filterValue={busca}
          sorting={sorted}
          onSortingChange={setSorted}
        />
      </div>
    </div>
  );
}
