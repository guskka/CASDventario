import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatarDataSemHora } from '../../remessas/remessas-textos';
import { PARTES_CHECKLIST, rotuloEstado, situacao, temProblema } from '../emprestimos-textos';

function Estado({ valor, mudou }) {
  if (valor === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <span className={temProblema(valor) ? 'font-medium text-destructive' : undefined}>
      {rotuloEstado(valor)}
      {mudou && <span className="ml-1 text-xs text-muted-foreground">(mudou)</span>}
    </span>
  );
}

const STATUS_NOTEBOOK = {
  DISPONIVEL: 'Disponível',
  INDISPONIVEL: 'Indisponível (emprestado)',
  MANUTENCAO: 'Em manutenção',
};

// Janela aberta ao clicar num empréstimo: dados do empréstimo e o checklist
// (estado na saída e, depois da devolução, o estado na volta, lado a lado).
export default function EmprestimoDetalhesDialog({ emprestimo, onFechar }) {
  const saida = emprestimo?.checklist_saida;
  const volta = emprestimo?.checklist_devolucao;
  const sit = emprestimo ? situacao(emprestimo.situacao) : null;

  return (
    <Dialog open={Boolean(emprestimo)} onOpenChange={(aberta) => !aberta && onFechar()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {emprestimo && (
          <>
            <DialogHeader>
              <DialogTitle>Empréstimo nº {emprestimo.id_emprestimo_notebook}</DialogTitle>
              <DialogDescription>{emprestimo.descricao}</DialogDescription>
            </DialogHeader>

            <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2">
              <dt className="text-muted-foreground">Aluno</dt>
              <dd>
                {emprestimo.aluno} (RM {emprestimo.rm_aluno})
              </dd>
              <dt className="text-muted-foreground">Notebook</dt>
              <dd>
                nº {emprestimo.id_notebook} · {emprestimo.notebook}
              </dd>
              <dt className="text-muted-foreground">Emprestado em</dt>
              <dd>{new Date(emprestimo.data_entrega).toLocaleString('pt-BR')}</dd>
              <dt className="text-muted-foreground">Devolver até</dt>
              <dd>{formatarDataSemHora(emprestimo.previsao_devolucao)}</dd>
              {emprestimo.data_devolucao && (
                <>
                  <dt className="text-muted-foreground">Devolvido em</dt>
                  <dd>{new Date(emprestimo.data_devolucao).toLocaleString('pt-BR')}</dd>
                </>
              )}
              <dt className="text-muted-foreground">Situação</dt>
              <dd>
                <Badge variant={sit.variant}>{sit.label}</Badge>
              </dd>
              <dt className="text-muted-foreground">Registrado por</dt>
              <dd>{emprestimo.registrado_por}</dd>
              <dt className="text-muted-foreground">Notebook agora</dt>
              <dd>{STATUS_NOTEBOOK[emprestimo.status_notebook] ?? emprestimo.status_notebook}</dd>
            </dl>

            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-card">
                  <TableRow>
                    <TableHead className="font-bold">Parte</TableHead>
                    <TableHead className="font-bold">Na saída</TableHead>
                    {volta && <TableHead className="font-bold">Na devolução</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PARTES_CHECKLIST.map((parte) => (
                    <TableRow key={parte.chave}>
                      <TableCell className="font-medium">{parte.label}</TableCell>
                      <TableCell>
                        <Estado valor={saida?.[parte.coluna]} />
                      </TableCell>
                      {volta && (
                        <TableCell>
                          <Estado
                            valor={volta[parte.coluna]}
                            mudou={volta[parte.coluna] !== saida?.[parte.coluna]}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {saida?.observacoes && (
              <p className="text-sm">
                <span className="text-muted-foreground">Observações na saída: </span>
                {saida.observacoes}
              </p>
            )}
            {volta?.observacoes && (
              <p className="text-sm">
                <span className="text-muted-foreground">Observações na devolução: </span>
                {volta.observacoes}
              </p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
