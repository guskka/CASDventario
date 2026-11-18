import { useEffect, useMemo, useState } from 'react';

import { MagnifyingGlassIcon } from '@phosphor-icons/react';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import BotaoDirecaoOrdem from '@/components/botao-direcao-ordem';
import FiltroSelect from '@/components/filtro-select';
import EntregasDataTable from '../columns';
import { listarEntregas } from '@/lib/api';
import { ENTREGAS_ALTERADAS } from '@/lib/eventos';

// Lista de entregas de kits: mesmo modelo das outras listas.

const ORDER_BY = [
  { label: 'Data', value: 'data_entrega_kit' },
  { label: 'Aluno', value: 'aluno' },
  { label: 'Quantidade', value: 'qtd_entregue' },
];

const TODOS = 'TODOS';

export default function EntregasSection() {
  const [entregas, setEntregas] = useState([]);
  const [busca, setBusca] = useState('');
  const [sorted, setSorted] = useState([{ id: 'data_entrega_kit', desc: true }]);
  const [material, setMaterial] = useState(TODOS);
  const [erro, setErro] = useState('');

  useEffect(() => {
    function carregar() {
      listarEntregas()
        .then((data) => {
          setEntregas(data);
          setErro('');
        })
        .catch((error) => setErro(error.message));
    }

    carregar();
    window.addEventListener(ENTREGAS_ALTERADAS, carregar);
    return () => window.removeEventListener(ENTREGAS_ALTERADAS, carregar);
  }, []);

  const filtroMaterial = useMemo(
    () => [
      { label: 'Todos os materiais', value: TODOS },
      ...[...new Set(entregas.map((e) => e.material))]
        .sort((a, b) => a.localeCompare(b, 'pt-BR'))
        .map((nome) => ({ label: nome, value: nome })),
    ],
    [entregas],
  );

  const entregasFiltradas = useMemo(
    () => entregas.filter((e) => material === TODOS || e.material === material),
    [entregas, material],
  );

  const totalItens = entregas.reduce((soma, e) => soma + e.qtd_entregue, 0);

  const handleOrderByChange = (columnId) => {
    if (columnId) {
      setSorted(([atual]) => [{ id: columnId, desc: atual?.desc ?? false }]);
    }
  };
  const inverterOrdem = () => setSorted(([atual]) => [{ id: atual.id, desc: !atual.desc }]);

  return (
    <div className="rounded-md border-2">
      <div className="flex items-center justify-between rounded-t-md px-4 w-full h-16 bg-card">
        <h4 className="font-semibold text-lg">Entregas</h4>

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
              placeholder="Buscar por aluno, RM ou material..."
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
            items={filtroMaterial}
            value={material}
            onValueChange={setMaterial}
            dica="Material"
          />
          <span className="ml-auto text-sm text-muted-foreground">
            {entregas.length} {entregas.length === 1 ? 'entrega' : 'entregas'} · {totalItens}{' '}
            itens entregues
          </span>
        </div>

        {erro && (
          <p className="text-sm text-destructive">Não foi possível carregar as entregas: {erro}</p>
        )}
        <EntregasDataTable
          entregas={entregasFiltradas}
          filterValue={busca}
          sorting={sorted}
          onSortingChange={setSorted}
        />
      </div>
    </div>
  );
}
