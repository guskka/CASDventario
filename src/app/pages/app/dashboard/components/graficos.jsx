import { useRef, useState } from 'react';
import { ChartBarIcon, TableIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Gráficos do Dashboard (item 21a), desenhados à mão em SVG/CSS (sem biblioteca).
// Regras seguidas em todos:
//  - cores só das variáveis --grafico-* (main.css), conferidas com o validador
//    de paleta nos dois temas; textos sempre nas cores de texto do tema;
//  - todo número também aparece escrito (legenda ou rótulo) e na "tabela";
//  - passar o mouse (ou o Tab do teclado) mostra uma dica com o valor;
//  - 2px de "vão" na cor do cartão separam partes que se encostam.

const COR = {
  laranja: 'var(--grafico-laranja)',
  azul: 'var(--grafico-azul)',
  marrom: 'var(--grafico-marrom)',
};

const porcento = (parte, total) => (total ? Math.round((parte / total) * 100) : 0);
const numero = (n) => Number(n ?? 0).toLocaleString('pt-BR');
const plural = (n, um, varios) => `${numero(n)} ${n === 1 ? um : varios}`;

// ---------- Peças comuns ----------

// Moldura: título, descrição e o botão que troca entre o gráfico e a tabela
// com os mesmos números (para quem não enxerga bem as cores, ou prefere ler).
function CartaoGrafico({ titulo, descricao, tabela, children, className }) {
  const [verTabela, setVerTabela] = useState(false);
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-semibold">{titulo}</CardTitle>
        {descricao && <CardDescription>{descricao}</CardDescription>}
        {tabela && (
          <CardAction>
            <Button variant="ghost" size="sm" onClick={() => setVerTabela(!verTabela)}>
              {verTabela ? <ChartBarIcon /> : <TableIcon />}
              {verTabela ? 'Ver gráfico' : 'Ver tabela'}
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>{verTabela ? tabela : children}</CardContent>
    </Card>
  );
}

// Legenda: quadradinho na cor da parte + nome + número (o texto não usa a cor).
function Legenda({ itens }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
      {itens.map((item) => (
        <li key={item.nome} className="flex items-center gap-2">
          <span className="size-3 shrink-0 rounded-[3px]" style={{ background: item.cor }} aria-hidden="true" />
          <span className="text-muted-foreground">{item.nome}</span>
          <span className="font-medium text-foreground">{item.texto}</span>
        </li>
      ))}
    </ul>
  );
}

// Dica que acompanha o mouse (ou aparece no elemento com foco do teclado).
// O valor vem em destaque e o nome em segundo plano.
function useDica() {
  const area = useRef(null);
  const [dica, setDica] = useState(null);

  function posicao(evento) {
    const caixa = area.current.getBoundingClientRect();
    if (evento.clientX !== undefined && evento.type.startsWith('pointer')) {
      return { x: evento.clientX - caixa.left, y: evento.clientY - caixa.top };
    }
    const alvo = evento.currentTarget.getBoundingClientRect();
    return { x: alvo.left + alvo.width / 2 - caixa.left, y: alvo.top - caixa.top };
  }

  // props para cada parte do gráfico que mostra uma dica
  function alvo(conteudo, rotuloAcessivel) {
    const mostrar = (evento) => setDica({ ...posicao(evento), ...conteudo });
    return {
      tabIndex: 0,
      'aria-label': rotuloAcessivel,
      onPointerMove: mostrar,
      onPointerLeave: () => setDica(null),
      onFocus: mostrar,
      onBlur: () => setDica(null),
    };
  }

  const elemento = dica && (
    <div
      role="presentation"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-md bg-foreground px-3 py-1.5 text-xs whitespace-nowrap text-background shadow-md"
      style={{ left: dica.x, top: dica.y }}
    >
      <span className="block text-sm font-semibold">{dica.valor}</span>
      <span className="opacity-80">{dica.nome}</span>
    </div>
  );
  return { area, alvo, elemento };
}

function TabelaSimples({ colunas, linhas, rodape }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {colunas.map((c, i) => (
            <TableHead key={c} className={i > 0 ? 'text-right' : undefined}>
              {c}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {linhas.map((linha) => (
          <TableRow key={linha[0]}>
            {linha.map((valor, i) => (
              <TableCell key={i} className={i > 0 ? 'text-right tabular-nums' : 'whitespace-normal'}>
                {valor}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
      {rodape && (
        <TableFooter>
          <TableRow>
            {rodape.map((valor, i) => (
              <TableCell key={i} className={i > 0 ? 'text-right tabular-nums font-medium' : 'font-medium'}>
                {valor}
              </TableCell>
            ))}
          </TableRow>
        </TableFooter>
      )}
    </Table>
  );
}

function SemDados({ children }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{children}</p>;
}

// Ponto da circunferência no ângulo (0° = 12 horas, sentido horário).
function ponto(cx, cy, raio, graus) {
  const rad = (graus * Math.PI) / 180;
  return [cx + raio * Math.sin(rad), cy - raio * Math.cos(rad)];
}
function arco(cx, cy, raio, de, ate) {
  const [x1, y1] = ponto(cx, cy, raio, de);
  const [x2, y2] = ponto(cx, cy, raio, ate);
  return `M ${x1} ${y1} A ${raio} ${raio} 0 ${ate - de > 180 ? 1 : 0} 1 ${x2} ${y2}`;
}

// ---------- 1. Medidor "Kits entregues" ----------
// Cada aluno ativo deve receber 1 unidade de cada material do ano.
// % = entregas feitas ÷ entregas esperadas (a mesma regra da tela Entregas).

const INICIO = -120; // o arco vai de -120° a +120° (abre embaixo, como no protótipo)
const VARREDURA = 240;

export function MedidorKits({ kits, alunosAtivos }) {
  const { area, alvo, elemento } = useDica();
  const { ano, esperadas, entregues, pendentes, percentual, por_material: porMaterial } = kits;

  const tabela = porMaterial.length > 0 && (
    <TabelaSimples
      colunas={['Material', 'Entregues', 'Pendentes']}
      linhas={porMaterial.map((m) => [m.nome, numero(m.entregues), numero(m.pendentes)])}
      rodape={['Total', numero(entregues), numero(pendentes)]}
    />
  );

  let conteudo;
  if (percentual === null) {
    conteudo = (
      <SemDados>
        {kits.materiais === 0
          ? `Nenhum material de ${ano} no estoque ainda.`
          : 'Nenhum aluno ativo para receber os materiais.'}
      </SemDados>
    );
  } else {
    const [cx, cy, raio, espessura] = [110, 112, 84, 18];
    const fracao = entregues / esperadas;
    const fimEntregue = INICIO + VARREDURA * fracao;
    const dicaEntregue = alvo(
      { valor: `${numero(entregues)} (${porcento(entregues, esperadas)}%)`, nome: 'Entregues' },
      `Entregues: ${entregues} de ${esperadas}`,
    );
    const dicaPendente = alvo(
      { valor: `${numero(pendentes)} (${porcento(pendentes, esperadas)}%)`, nome: 'Pendentes' },
      `Pendentes: ${pendentes} de ${esperadas}`,
    );
    conteudo = (
      <div className="space-y-4">
        <Legenda
          itens={[
            { nome: 'Entregue', cor: COR.laranja, texto: numero(entregues) },
            { nome: 'Pendente', cor: COR.marrom, texto: numero(pendentes) },
          ]}
        />
        <div ref={area} className="relative mx-auto w-full max-w-64">
          <svg viewBox="0 0 220 190" className="w-full" role="img" aria-label={`${percentual}% das entregas de ${ano} feitas`}>
            {pendentes > 0 && (
              <path
                d={arco(cx, cy, raio, INICIO, INICIO + VARREDURA)}
                fill="none"
                stroke={COR.marrom}
                strokeWidth={espessura}
                strokeLinecap="round"
                className="outline-none hover:brightness-110 focus-visible:brightness-125"
                {...dicaPendente}
              />
            )}
            {entregues > 0 && (
              <>
                {/* vão de 2px na cor do cartão onde o "entregue" encontra o "pendente" */}
                <path
                  d={arco(cx, cy, raio, INICIO, fimEntregue)}
                  fill="none"
                  stroke="var(--card)"
                  strokeWidth={espessura + 4}
                  strokeLinecap="round"
                  aria-hidden="true"
                  pointerEvents="none"
                />
                <path
                  d={arco(cx, cy, raio, INICIO, fimEntregue)}
                  fill="none"
                  stroke={COR.laranja}
                  strokeWidth={espessura}
                  strokeLinecap="round"
                  className="outline-none hover:brightness-110 focus-visible:brightness-125"
                  {...dicaEntregue}
                />
              </>
            )}
          </svg>
          {/* número em destaque no centro do arco */}
          <div className="pointer-events-none absolute inset-x-0 top-[44%] text-center">
            <p className="text-4xl font-semibold text-foreground">{percentual}%</p>
            <p className="text-xs text-muted-foreground">
              {numero(entregues)} de {plural(esperadas, 'entrega', 'entregas')}
            </p>
          </div>
          {elemento}
        </div>
      </div>
    );
  }

  return (
    <CartaoGrafico
      titulo="Kits entregues"
      descricao={`Materiais de ${ano}: 1 de cada para cada um dos ${plural(alunosAtivos, 'aluno ativo', 'alunos ativos')}.`}
      tabela={tabela}
    >
      {conteudo}
    </CartaoGrafico>
  );
}

// ---------- 2. Pizza "Notebooks" ----------
// 3 fatias: disponíveis, emprestados e em manutenção (os inativos ficam de fora).

export function PizzaNotebooks({ notebooks }) {
  const { area, alvo, elemento } = useDica();
  const partes = [
    { nome: 'Disponíveis', valor: notebooks.disponiveis, cor: COR.laranja },
    { nome: 'Emprestados', valor: notebooks.emprestados, cor: COR.azul },
    { nome: 'Em manutenção', valor: notebooks.manutencao, cor: COR.marrom },
  ];
  const total = partes.reduce((soma, p) => soma + p.valor, 0);

  const tabela = (
    <TabelaSimples
      colunas={['Situação', 'Notebooks', '%']}
      linhas={partes.map((p) => [p.nome, numero(p.valor), `${porcento(p.valor, total)}%`])}
      rodape={['Total em uso', numero(total), total ? '100%' : '0%']}
    />
  );

  let conteudo;
  if (total === 0) {
    conteudo = <SemDados>Nenhum notebook em uso.</SemDados>;
  } else {
    const [c, raio] = [100, 92];
    const visiveis = partes.filter((p) => p.valor > 0);
    let angulo = 0;
    const fatias = visiveis.map((p) => {
      const de = angulo;
      angulo += (p.valor / total) * 360;
      const [x1, y1] = ponto(c, c, raio, de);
      const [x2, y2] = ponto(c, c, raio, angulo);
      const grande = angulo - de > 180 ? 1 : 0;
      return { ...p, d: `M ${c} ${c} L ${x1} ${y1} A ${raio} ${raio} 0 ${grande} 1 ${x2} ${y2} Z` };
    });
    conteudo = (
      <div className="space-y-4">
        <Legenda
          itens={partes.map((p) => ({
            nome: p.nome,
            cor: p.cor,
            texto: `${numero(p.valor)} (${porcento(p.valor, total)}%)`,
          }))}
        />
        <div ref={area} className="relative mx-auto w-full max-w-56">
          <svg viewBox="0 0 200 200" className="w-full" role="img" aria-label={`${total} notebooks em uso`}>
            {fatias.map((f) => {
              const props = {
                fill: f.cor,
                // vão de 2px entre as fatias, na cor do cartão
                stroke: 'var(--card)',
                strokeWidth: 2,
                strokeLinejoin: 'round',
                className: 'outline-none hover:brightness-110 focus-visible:brightness-125',
                ...alvo(
                  { valor: `${numero(f.valor)} (${porcento(f.valor, total)}%)`, nome: f.nome },
                  `${f.nome}: ${f.valor} de ${total}`,
                ),
              };
              return visiveis.length === 1 ? (
                <circle key={f.nome} cx={c} cy={c} r={raio} {...props} />
              ) : (
                <path key={f.nome} d={f.d} {...props} />
              );
            })}
          </svg>
          {elemento}
        </div>
      </div>
    );
  }

  return (
    <CartaoGrafico
      titulo="Notebooks"
      descricao={`Os ${plural(total, 'notebook em uso', 'notebooks em uso')} (sem os inativos).`}
      tabela={tabela}
    >
      {conteudo}
    </CartaoGrafico>
  );
}

// ---------- 3. Barras "Notebooks emprestados por mês" ----------
// Uma série só (uma cor, sem legenda): empréstimos feitos em cada mês, de março a dezembro.

// Escala "redonda" para o eixo: 0, 5, 10... ou 0, 10, 20...
function escala(maximo) {
  if (maximo <= 5) return { topo: 5, passo: 1 };
  const passos = [2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
  const passo = passos.find((p) => maximo / p <= 6) ?? 1000;
  return { topo: Math.ceil(maximo / passo) * passo, passo };
}

export function BarrasPorMes({ porMes }) {
  const { area, alvo, elemento } = useDica();
  const { ano, meses } = porMes;
  const total = meses.reduce((soma, m) => soma + m.quantidade, 0);
  const { topo, passo } = escala(Math.max(...meses.map((m) => m.quantidade)));
  const marcas = Array.from({ length: topo / passo + 1 }, (_, i) => i * passo);
  const posicao = (valor) => `${(valor / topo) * 100}%`;

  const tabela = (
    <TabelaSimples
      colunas={['Mês', 'Empréstimos']}
      linhas={meses.map((m) => [m.nome, numero(m.quantidade)])}
      rodape={['Total', numero(total)]}
    />
  );

  return (
    <CartaoGrafico
      titulo="Notebooks emprestados por mês"
      descricao={`Empréstimos feitos em cada mês de ${ano} (março a dezembro).`}
      tabela={tabela}
    >
      <div ref={area} className="relative">
        <div className="space-y-1">
          {meses.map((m) => (
            <div key={m.mes} className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
              <span className="text-right text-sm text-muted-foreground">{m.nome}</span>
              {/* mr-10: espaço para o número depois da barra mais comprida */}
              <div
                className="relative mr-10 h-6 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...alvo(
                  { valor: plural(m.quantidade, 'empréstimo', 'empréstimos'), nome: `${m.nome} de ${ano}` },
                  `${m.nome}: ${m.quantidade} empréstimos`,
                )}
              >
                {marcas.map((marca) => (
                  <span
                    key={marca}
                    className="absolute inset-y-0 w-px bg-border"
                    style={{ left: posicao(marca) }}
                    aria-hidden="true"
                  />
                ))}
                {m.quantidade > 0 && (
                  <span
                    className="absolute top-1 h-4 rounded-r-[4px] hover:brightness-110"
                    style={{ width: posicao(m.quantidade), background: COR.azul }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className="absolute top-1/2 -translate-y-1/2 pl-1.5 text-xs font-medium text-foreground tabular-nums"
                  style={{ left: posicao(m.quantidade) }}
                  aria-hidden="true"
                >
                  {m.quantidade}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* eixo: 0, passo, 2×passo... */}
        <div className="mt-1 grid grid-cols-[5.5rem_1fr] gap-3" aria-hidden="true">
          <span />
          <div className="relative mr-10 h-4">
            {marcas.map((marca) => (
              <span
                key={marca}
                className="absolute -translate-x-1/2 text-xs text-muted-foreground tabular-nums"
                style={{ left: posicao(marca) }}
              >
                {marca}
              </span>
            ))}
          </div>
        </div>
        {elemento}
      </div>
    </CartaoGrafico>
  );
}
