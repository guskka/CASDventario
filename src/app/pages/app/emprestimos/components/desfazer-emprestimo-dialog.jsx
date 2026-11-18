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
import { desfazerEmprestimo } from '@/lib/api';
import { avisar, EMPRESTIMOS_ALTERADOS, NOTEBOOKS_ALTERADOS } from '@/lib/eventos';

// Desfaz um empréstimo registrado por engano (só antes da devolução):
// o empréstimo e o checklist de saída são apagados e o notebook volta a ficar disponível.
export default function DesfazerEmprestimoDialog({ emprestimo }) {
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
      await desfazerEmprestimo(emprestimo.id_emprestimo_notebook);
      toast.add({
        type: 'success',
        description: `Empréstimo desfeito: o notebook nº ${emprestimo.id_notebook} voltou a ficar disponível.`,
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
            aria-label={`Desfazer empréstimo nº ${emprestimo.id_emprestimo_notebook}`}
          />
        }
      >
        <ArrowCounterClockwiseIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desfazer empréstimo?</DialogTitle>
          <DialogDescription>
            O empréstimo ({emprestimo.descricao}) e o checklist de saída serão apagados, e o
            notebook volta a ficar disponível. Use isto só para corrigir um registro feito por
            engano. Se o aluno devolveu o notebook, use &ldquo;Registrar devolução&rdquo;.
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
