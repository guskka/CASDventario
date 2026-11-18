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
import { ACOES, ENTIDADES, formatarValor, rotuloCampo } from '../log-textos';

// Janela aberta ao clicar numa linha da aba "Logs": mostra tudo sobre o
// registro (quando, quem, o quê) e os campos com os valores de antes/depois.
export default function LogDetalhesDialog({ log, onFechar }) {
  const acao = log ? (ACOES[log.acao] ?? { label: log.acao, variant: 'outline' }) : null;
  const detalhes = log?.detalhes;
  const ehEdicao = log?.acao === 'EDITOU';

  return (
    <Dialog open={Boolean(log)} onOpenChange={(aberta) => !aberta && onFechar()}>
      <DialogContent className="sm:max-w-2xl">
        {log && (
          <>
            <DialogHeader>
              <DialogTitle>Detalhes do registro</DialogTitle>
              <DialogDescription>
                {log.nome_usuario} {log.descricao}
              </DialogDescription>
            </DialogHeader>

            <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2">
              <dt className="text-muted-foreground">Data e hora</dt>
              <dd>{new Date(log.criado_em).toLocaleString('pt-BR')}</dd>
              <dt className="text-muted-foreground">Quem fez</dt>
              <dd>{log.nome_usuario}</dd>
              <dt className="text-muted-foreground">Ação</dt>
              <dd>
                <Badge variant={acao.variant}>{acao.label}</Badge>
              </dd>
              <dt className="text-muted-foreground">Registro</dt>
              <dd>
                {ENTIDADES[log.entidade] ?? log.entidade}
                {log.id_registro && ` nº ${log.id_registro}`}
              </dd>
            </dl>

            {detalhes?.length > 0 && (
              <div className="max-h-80 overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader className="bg-card">
                    <TableRow>
                      <TableHead className="font-bold">Campo</TableHead>
                      {ehEdicao ? (
                        <>
                          <TableHead className="font-bold">Antes</TableHead>
                          <TableHead className="font-bold">Depois</TableHead>
                        </>
                      ) : (
                        <TableHead className="font-bold">
                          {log.acao === 'EXCLUIU' ? 'Como estava' : 'Valor'}
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detalhes.map((item) => (
                      <TableRow key={item.campo}>
                        <TableCell className="font-medium">{rotuloCampo(item.campo)}</TableCell>
                        {ehEdicao ? (
                          <>
                            <TableCell className="text-muted-foreground whitespace-normal">
                              {formatarValor(item.antes)}
                            </TableCell>
                            <TableCell className="whitespace-normal">
                              {formatarValor(item.depois)}
                            </TableCell>
                          </>
                        ) : (
                          <TableCell className="whitespace-normal">
                            {formatarValor('depois' in item ? item.depois : item.antes)}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {ehEdicao && detalhes?.length === 0 && (
              <p className="text-muted-foreground">Nenhum campo mudou de valor nesta edição.</p>
            )}
            {!detalhes && (
              <p className="text-muted-foreground">
                Este registro é anterior aos detalhes completos: só a descrição acima foi guardada.
              </p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
