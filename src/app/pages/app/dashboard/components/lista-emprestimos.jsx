import { Link } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatarDataSemHora } from '../../remessas/remessas-textos';
import { textoPrazo } from '../../emprestimos/emprestimos-textos';

// Lista curta de empréstimos no Dashboard (atrasados ou que vencem em breve).
// destaque = true pinta o prazo com a cor de alerta (sempre junto do texto).
export default function ListaEmprestimos({ titulo, descricao, icone: Icone, emprestimos, vazio, destaque }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icone && <Icone className={destaque ? 'size-5 text-destructive' : 'size-5'} />}
          {titulo}
          <span className="text-sm font-normal text-muted-foreground">({emprestimos.length})</span>
        </CardTitle>
        <CardDescription>{descricao}</CardDescription>
      </CardHeader>
      <CardContent>
        {emprestimos.length === 0 ? (
          <p className="text-sm text-muted-foreground">{vazio}</p>
        ) : (
          <ul className="divide-y">
            {emprestimos.slice(0, 6).map((e) => (
              <li key={e.id_emprestimo_notebook} className="flex items-center justify-between gap-4 py-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{e.aluno}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    Notebook nº {e.id_notebook} · {e.notebook} · devolver até{' '}
                    {formatarDataSemHora(e.previsao_devolucao)}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm ${destaque ? 'font-medium text-destructive' : 'text-muted-foreground'}`}
                >
                  {textoPrazo(e.dias_para_devolver)}
                </span>
              </li>
            ))}
          </ul>
        )}
        {emprestimos.length > 6 && (
          <p className="pt-2 text-sm text-muted-foreground">
            e mais {emprestimos.length - 6}.{' '}
            <Link to="/emprestimos" className="font-medium text-primary hover:underline">
              Ver todos
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
