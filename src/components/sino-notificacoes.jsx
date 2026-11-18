import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, WarningCircleIcon } from '@phosphor-icons/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { listarEmprestimos, sessaoValida } from '@/lib/api';
import { EMPRESTIMOS_ALTERADOS } from '@/lib/eventos';
import { diasParaDevolver, textoPrazo } from '@/app/pages/app/emprestimos/emprestimos-textos';

const MAXIMO_NA_LISTA = 5;

// Sino do cabeçalho: avisa sobre empréstimos de notebook atrasados (decisão D11).
// O número vermelho mostra quantos são; clicar num aviso abre a página Empréstimos.
export default function SinoNotificacoes() {
  const navigate = useNavigate();
  const [atrasados, setAtrasados] = useState([]);

  useEffect(() => {
    function carregar() {
      if (!sessaoValida()) {
        return;
      }
      listarEmprestimos('ATRASADO')
        .then(setAtrasados)
        .catch(() => setAtrasados([])); // o sino nunca deve atrapalhar a página
    }

    carregar();
    window.addEventListener(EMPRESTIMOS_ALTERADOS, carregar);
    return () => window.removeEventListener(EMPRESTIMOS_ALTERADOS, carregar);
  }, []);

  const quantidade = atrasados.length;
  const rotulo =
    quantidade > 0
      ? `Notificações: ${quantidade} empréstimo(s) atrasado(s)`
      : 'Notificações: nenhuma';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="relative" aria-label={rotulo} />}
      >
        <BellIcon />
        {quantidade > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
            {quantidade}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {quantidade === 0 ? (
            <DropdownMenuItem disabled>Nenhuma notificação no momento.</DropdownMenuItem>
          ) : (
            atrasados.slice(0, MAXIMO_NA_LISTA).map((e) => (
              <DropdownMenuItem
                key={e.id_emprestimo_notebook}
                onClick={() => navigate('/emprestimos')}
              >
                <WarningCircleIcon weight="fill" className="text-destructive" />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate">{e.aluno}</span>
                  <span className="text-xs text-muted-foreground">
                    Notebook nº {e.id_notebook} · {textoPrazo(diasParaDevolver(e.previsao_devolucao))}
                  </span>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
        {quantidade > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/emprestimos')}>
                {quantidade > MAXIMO_NA_LISTA
                  ? `Ver todos os ${quantidade} atrasados`
                  : 'Ver empréstimos'}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
