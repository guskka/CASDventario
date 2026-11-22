import { useState } from 'react';
import { UsersThreeIcon } from '@phosphor-icons/react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DicaTextoCortado from '@/components/dica-texto-cortado';
import { toast } from '@/components/ui/toast';
import { desfazerEntregas, entregarMaterial } from '@/lib/api';
import { avisar, ENTREGAS_ALTERADAS } from '@/lib/eventos';

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

// Botão "Marcar pendentes do <curso> como recebidos" + confirmação.
// Entrega 1 unidade para cada pendente da lista filtrada. Só funciona com um
// curso escolhido no filtro (decisão da ONG: nunca para todos de uma vez).
// material = situacao.material (nome e saldo); pendentes = alunos da lista.
export default function EntregarPendentesDialog({ material, pendentes, rotuloCurso, turma }) {
  const [aberta, setAberta] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const disponivel = material?.qtd_disponivel ?? 0;
  const falta = pendentes.length > disponivel;
  const desabilitado = !rotuloCurso || !pendentes.length || disponivel === 0;
  const onde = [rotuloCurso, turma].filter(Boolean).join(', ');

  function abrirOuFechar(abrir) {
    if (abrir) {
      setErro('');
    }
    setAberta(abrir);
  }

  async function confirmar() {
    setErro('');
    setEnviando(true);
    try {
      const resposta = await entregarMaterial(
        material,
        pendentes.map((a) => a.rm_aluno),
      );
      const ids = resposta.entregas.map((e) => e.id_entrega_kit);
      const idAviso = toast.add({
        type: 'success',
        description: `${plural(ids.length, 'entrega registrada', 'entregas registradas')} de ${resposta.material} (${onde}).`,
        timeout: 10000,
        actionProps: {
          children: 'Desfazer',
          onClick: async () => {
            toast.close(idAviso);
            try {
              await desfazerEntregas(ids);
              toast.add({
                type: 'success',
                description: `${plural(ids.length, 'entrega desfeita', 'entregas desfeitas')}: as unidades voltaram para o estoque.`,
              });
            } catch (err) {
              toast.add({ type: 'error', description: err.message });
            } finally {
              avisar(ENTREGAS_ALTERADAS);
            }
          },
        },
      });
      avisar(ENTREGAS_ALTERADAS);
      setAberta(false);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={aberta} onOpenChange={abrirOuFechar}>
      <DialogTrigger render={<Button variant="secondary" disabled={desabilitado} />}>
        <UsersThreeIcon />
        {rotuloCurso
          ? `Marcar pendentes do ${rotuloCurso} como recebidos (${pendentes.length})`
          : 'Marcar pendentes como recebidos'}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Registrar a entrega para {plural(pendentes.length, 'aluno', 'alunos')} ({onde})?
          </DialogTitle>
          <DialogDescription>
            Cada aluno recebe 1 unidade de{' '}
            <strong className="text-foreground">{material?.nome}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm tabular-nums">
          <span className="text-muted-foreground">Estoque disponível</span>
          <strong>
            {disponivel} → {falta ? '—' : disponivel - pendentes.length}
          </strong>
        </div>
        {/* min-w-0: sem isso, um nome muito comprido alargava a lista para fora da janela */}
        <DicaTextoCortado className="min-w-0">
          <ul className="max-h-48 overflow-y-auto rounded-md border text-sm divide-y">
            {pendentes.map((a) => (
              <li key={a.rm_aluno} className="flex justify-between gap-3 px-3 py-1.5">
                <span className="truncate">{a.nome_completo}</span>
                <span className="text-muted-foreground">{a.turma ?? 'Sem turma'}</span>
              </li>
            ))}
          </ul>
        </DicaTextoCortado>

        {falta && (
          <p className="text-sm text-destructive">
            Só há {plural(disponivel, 'unidade disponível', 'unidades disponíveis')} para{' '}
            {pendentes.length} pendentes. Filtre também por turma para entregar em partes, ou
            registre uma nova remessa.
          </p>
        )}
        {erro && <p className="text-sm text-destructive">{erro}</p>}

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          <Button onClick={confirmar} disabled={falta || enviando}>
            {enviando
              ? 'Registrando...'
              : `Confirmar ${plural(pendentes.length, 'entrega', 'entregas')}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
