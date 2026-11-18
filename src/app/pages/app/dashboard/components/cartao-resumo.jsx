import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@phosphor-icons/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Cartão de resumo do Dashboard: nome (sem dois-pontos), número em destaque,
// uma linha de detalhe e um link para a página daquele assunto.
export default function CartaoResumo({ titulo, valor, detalhe, link, textoLink, icone: Icone }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {Icone && <Icone className="size-4" />}
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-3xl font-semibold text-foreground">
          {Number(valor ?? 0).toLocaleString('pt-BR')}
        </p>
        <div className="min-h-5 text-sm text-muted-foreground">{detalhe}</div>
        {link && (
          <Link
            to={link}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {textoLink}
            <ArrowRightIcon className="size-3.5" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
