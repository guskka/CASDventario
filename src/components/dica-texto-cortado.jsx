import { useState } from 'react';

import { Tooltip, TooltipContent } from '@/components/ui/tooltip';

const FECHADA = { aberta: false, ancora: null, texto: '' };

// Ao passar o mouse sobre um texto cortado com "..." (classe "truncate") dentro
// de children, mostra o texto completo numa dica logo abaixo dele. Textos que
// cabem inteiros não ganham dica. Uma dica só para a área toda, em vez de uma
// por célula, para não pesar nas listas grandes (100 linhas por página).
export default function DicaTextoCortado({ children, className }) {
  const [dica, setDica] = useState(FECHADA);

  function fechar() {
    // Mantém a âncora e o texto para a dica sumir no mesmo lugar (animação).
    setDica((atual) => (atual.aberta ? { ...atual, aberta: false } : atual));
  }

  function aoPassarMouse(evento) {
    const cortado = acharTextoCortado(evento.target, evento.currentTarget);
    if (!cortado) {
      fechar();
      return;
    }
    if (dica.aberta && cortado === dica.ancora) return;
    setDica({ aberta: true, ancora: cortado, texto: cortado.innerText });
  }

  return (
    <div className={className} onMouseOver={aoPassarMouse} onMouseLeave={fechar}>
      {children}
      <Tooltip open={dica.aberta} onOpenChange={(abrir) => !abrir && fechar()}>
        {/* pointer-events-none: a dica só mostra texto. Sem isso, ela cobriria a
            linha de baixo e impediria o mouse de chegar nela. */}
        <TooltipContent
          anchor={dica.ancora}
          side="bottom"
          positionerClassName="pointer-events-none"
          className="pointer-events-none max-w-sm whitespace-normal [overflow-wrap:anywhere]"
        >
          {dica.texto}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

// Procura o texto cortado que o mouse está "apontando": primeiro o próprio
// elemento sob o mouse; senão, qualquer texto cortado da mesma célula ou item
// de lista (ex.: o mouse sobre a foto do aluno mostra o nome cortado ao lado).
function acharTextoCortado(alvo, area) {
  if (!(alvo instanceof Element)) return null;
  const candidatos = [alvo.closest('.truncate')];
  const unidade = alvo.closest('td, li');
  if (unidade) {
    candidatos.push(unidade, ...unidade.querySelectorAll('.truncate'));
  }
  return (
    candidatos.find(
      (el) =>
        el &&
        el !== area &&
        area.contains(el) &&
        el.scrollWidth > el.clientWidth &&
        el.innerText.trim(),
    ) ?? null
  );
}
