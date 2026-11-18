import { SortAscendingIcon, SortDescendingIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

// Botão ao lado do "Ordenar por" que inverte a ordem da lista
// (crescente <-> decrescente). Usado nas listas no modelo de Administradores.
export default function BotaoDirecaoOrdem({ desc, onToggle }) {
  const texto = desc
    ? 'Ordem decrescente (clique para inverter)'
    : 'Ordem crescente (clique para inverter)';

  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant="outline" size="icon" onClick={onToggle} aria-label={texto} />}
      >
        {desc ? <SortDescendingIcon /> : <SortAscendingIcon />}
      </TooltipTrigger>
      <TooltipContent side="bottom">{texto}</TooltipContent>
    </Tooltip>
  );
}
