import { useState } from 'react';
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';

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
import { toast } from '@/components/ui/toast';
import { desfazerDevolucao } from '@/lib/api';
import { avisar, EMPRESTIMOS_ALTERADOS, NOTEBOOKS_ALTERADOS } from '@/lib/eventos';

// Desfaz uma devolução registrada por engano: o empréstimo volta a ficar em
// aberto e o notebook volta a constar como emprestado.
export default function DesfazerDevolucaoDialog({ emprestimo }) {
  const [aberta, setAberta] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  function abrirOuFechar(abrir) {
    if (abrir) {
      setErro('');
    }
    setAberta(abrir);
  }

  async function desfazer() {
    setErro('');
    setEnviando(true);
    try {
      await desfazerDevolucao(emprestimo.id_devolucao);
      toast.add({
        type: 'success',
        description: 'Devolução desfeita: o empréstimo voltou a ficar em aberto.',
      });
      avisar(EMPRESTIMOS_ALTERADOS);
      avisar(NOTEBOOKS_ALTERADOS);
      setAberta(false);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={aberta} onOpenChange={abrirOuFechar}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            aria-label={`Desfazer devolução do empréstimo nº ${emprestimo.id_emprestimo_notebook}`}
          />
        }
      >
        <ArrowCounterClockwiseIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desfazer devolução?</DialogTitle>
          <DialogDescription>
            A devolução de {emprestimo.descricao} e o checklist de volta serão apagados. O
            empréstimo volta a ficar em aberto e o notebook volta a constar como emprestado. Use isto
            só para corrigir uma devolução registrada por engano.
          </DialogDescription>
        </DialogHeader>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          <Button variant="destructive" onClick={desfazer} disabled={enviando}>
            {enviando ? 'Desfazendo...' : 'Sim, desfazer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
