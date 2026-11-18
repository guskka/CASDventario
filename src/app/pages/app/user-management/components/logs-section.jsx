import { useEffect, useState } from 'react';

import { MagnifyingGlassIcon } from '@phosphor-icons/react';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectGroup,
} from '@/components/ui/select';

import BotaoDirecaoOrdem from '@/components/botao-direcao-ordem';
import LogsDataTable from '../logs-columns';
import LogDetalhesDialog from './log-detalhes-dialog';
import { listarLogs } from '@/lib/api';
import { USUARIOS_ALTERADOS } from '@/lib/eventos';

// Aba "Logs": histórico de quem criou, editou ou excluiu o quê e quando.
// Mesmo modelo da lista de administradores (components/table-section.jsx).

// desc = ordem inicial ao escolher a opção (Data começa pelos mais recentes).
// O botão ao lado inverte a ordem.
const ORDER_BY = [
  { label: 'Data', value: 'criado_em', desc: true },
  { label: 'Quem', value: 'nome_usuario', desc: false },
  { label: 'Ação', value: 'acao', desc: false },
];

export default function LogsSection() {
  const [busca, setBusca] = useState('');
  const [logs, setLogs] = useState([]);
  const [sorted, setSorted] = useState([{ id: 'criado_em', desc: true }]);
  const [erro, setErro] = useState('');
  const [logAberto, setLogAberto] = useState(null); // linha clicada (janela de detalhes)

  const handleOrderByChange = (columnId) => {
    const opcao = ORDER_BY.find((item) => item.value === columnId);
    if (opcao) {
      setSorted([{ id: opcao.value, desc: opcao.desc }]);
    }
  };

  const inverterOrdem = () => setSorted(([atual]) => [{ id: atual.id, desc: !atual.desc }]);

  useEffect(() => {
    function carregar() {
      listarLogs()
        .then((data) => {
          setLogs(data);
          setErro('');
        })
        .catch((error) => setErro(error.message));
    }

    carregar();

    // Uma edição feita nesta tela gera um log novo: recarrega o histórico.
    window.addEventListener(USUARIOS_ALTERADOS, carregar);
    return () => window.removeEventListener(USUARIOS_ALTERADOS, carregar);
  }, []);

  return (
    <div className="rounded-md border-2">
      <div className="flex items-center justify-between rounded-t-md px-4 w-full h-16 bg-card">
        <h4 className="font-semibold text-lg">Logs</h4>

        <div className="flex gap-2">
          <Select items={ORDER_BY} value={sorted[0]?.id} onValueChange={handleOrderByChange}>
            <Tooltip>
              <TooltipTrigger render={<SelectTrigger />}>
                <SelectValue />
              </TooltipTrigger>
              <TooltipContent side="bottom">Ordenar por</TooltipContent>
            </Tooltip>
            <SelectContent>
              <SelectGroup>
                {ORDER_BY.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <BotaoDirecaoOrdem desc={sorted[0]?.desc} onToggle={inverterOrdem} />
          <InputGroup className="ml-2">
            <InputGroupInput
              placeholder="Buscar no histórico..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <InputGroupAddon>
              <MagnifyingGlassIcon />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>

      <div className="p-4 w-full">
        {erro && (
          <p className="mb-4 text-sm text-destructive">
            Não foi possível carregar o histórico: {erro}
          </p>
        )}
        <p className="mb-2 text-sm text-muted-foreground">
          Clique numa linha para ver todos os detalhes.
        </p>
        <LogsDataTable
          logs={logs}
          filterValue={busca}
          sorting={sorted}
          onSortingChange={setSorted}
          onRowClick={setLogAberto}
        />
      </div>
      <LogDetalhesDialog log={logAberto} onFechar={() => setLogAberto(null)} />
    </div>
  );
}
