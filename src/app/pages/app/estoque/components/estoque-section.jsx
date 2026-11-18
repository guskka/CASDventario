import { useEffect, useMemo, useState } from 'react';

import { MagnifyingGlassIcon } from '@phosphor-icons/react';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import BotaoDirecaoOrdem from '@/components/botao-direcao-ordem';
import FiltroSelect from '@/components/filtro-select';
import EstoqueDataTable from '../columns';
import { resumoEstoque } from '@/lib/api';
import { REMESSAS_ALTERADAS } from '@/lib/eventos';

// Tela Estoque: quanto há de cada material (somando todas as remessas).
// Mesmo modelo das outras listas, mas só de consulta.

const ORDER_BY = [
  { label: 'Material', value: 'nome' },
  { label: 'Ano letivo', value: 'ano_letivo_material' },
  { label: 'Disponíveis', value: 'qtd_disponivel' },
];

const TODOS = 'TODOS';

export default function EstoqueSection() {
  const [grupos, setGrupos] = useState([]);
  const [busca, setBusca] = useState('');
  const [sorted, setSorted] = useState([{ id: 'nome', desc: false }]);
  const [material, setMaterial] = useState(TODOS);
  const [ano, setAno] = useState(TODOS);
  const [erro, setErro] = useState('');

  useEffect(() => {
    function carregar() {
      resumoEstoque()
        .then((data) => {
          setGrupos(data);
          setErro('');
        })
        .catch((error) => setErro(error.message));
    }

    carregar();
    window.addEventListener(REMESSAS_ALTERADAS, carregar);
    return () => window.removeEventListener(REMESSAS_ALTERADAS, carregar);
  }, []);

  // Opções dos filtros a partir do que existe no estoque.
  const filtroMaterial = useMemo(
    () => [
      { label: 'Todos os materiais', value: TODOS },
      ...[...new Set(grupos.map((g) => g.material))]
        .sort((a, b) => a.localeCompare(b, 'pt-BR'))
        .map((nome) => ({ label: nome, value: nome })),
    ],
    [grupos],
  );
  const filtroAno = useMemo(
    () => [
      { label: 'Todos os anos', value: TODOS },
      ...[...new Set(grupos.map((g) => g.ano_letivo_material))]
        .sort((a, b) => b - a)
        .map((valor) => ({ label: String(valor), value: String(valor) })),
    ],
    [grupos],
  );

  const gruposFiltrados = useMemo(
    () =>
      grupos.filter(
        (g) =>
          (material === TODOS || g.material === material) &&
          (ano === TODOS || String(g.ano_letivo_material) === ano),
      ),
    [grupos, material, ano],
  );

  const totalDisponivel = grupos.reduce((soma, g) => soma + g.qtd_disponivel, 0);
  const esgotados = grupos.filter((g) => g.qtd_disponivel === 0).length;

  const handleOrderByChange = (columnId) => {
    if (columnId) {
      setSorted(([atual]) => [{ id: columnId, desc: atual?.desc ?? false }]);
    }
  };
  const inverterOrdem = () => setSorted(([atual]) => [{ id: atual.id, desc: !atual.desc }]);

  return (
    <div className="rounded-md border-2">
      <div className="flex items-center justify-between rounded-t-md px-4 w-full h-16 bg-card">
        <h4 className="font-semibold text-lg">Estoque por material</h4>

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
              placeholder="Buscar material..."
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
            dica="Tipo de material"
          />
          <FiltroSelect items={filtroAno} value={ano} onValueChange={setAno} dica="Ano letivo" />
          <span className="ml-auto text-sm text-muted-foreground">
            {grupos.length} {grupos.length === 1 ? 'material' : 'materiais'} · {totalDisponivel}{' '}
            itens disponíveis · {esgotados} esgotado(s)
          </span>
        </div>

        {erro && (
          <p className="text-sm text-destructive">Não foi possível carregar o estoque: {erro}</p>
        )}
        {grupos.length === 0 && !erro && (
          <p className="text-sm text-muted-foreground">
            O estoque está vazio. Registre uma remessa na tela Remessas para ele aparecer aqui.
          </p>
        )}
        <EstoqueDataTable
          grupos={gruposFiltrados}
          filterValue={busca}
          sorting={sorted}
          onSortingChange={setSorted}
        />
      </div>
    </div>
  );
}
