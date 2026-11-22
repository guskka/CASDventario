import { Card, CardContent } from '@/components/ui/card';

// Fundo e cor do ícone de cada cartão, como no protótipo (azul, laranja e verde).
// O número e o título usam as cores de texto do tema.
const TONS = {
  azul: 'bg-[color-mix(in_oklab,var(--grafico-azul)_15%,transparent)] text-[var(--grafico-azul)]',
  laranja: 'bg-[color-mix(in_oklab,var(--grafico-laranja)_18%,transparent)] text-[var(--grafico-marrom)] dark:text-[var(--grafico-laranja)]',
  verde: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
};

// Cartão de número do Dashboard (modelo do protótipo): ícone, título e o número.
export default function CartaoResumo({ titulo, valor, icone: Icone, tom = 'azul' }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${TONS[tom]}`}>
          {Icone && <Icone className="size-6" aria-hidden="true" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{titulo}</p>
          <p className="text-3xl font-semibold text-foreground">
            {Number(valor ?? 0).toLocaleString('pt-BR')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
