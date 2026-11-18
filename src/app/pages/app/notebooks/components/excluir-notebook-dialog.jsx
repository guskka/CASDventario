import { useState } from 'react';
import { TrashIcon } from '@phosphor-icons/react';

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
import { deletarNotebook } from '@/lib/api';
import { avisar, NOTEBOOKS_ALTERADOS } from '@/lib/eventos';

// Confirmação antes de excluir um notebook. Se ele já tiver empréstimos ou
// checklists registrados, a API recusa e a mensagem aparece na janela.
export default function ExcluirNotebookDialog({ notebook }) {
  const [aberta, setAberta] = useState(false);
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(false);

  function abrirOuFechar(abrir) {
    if (abrir) {
      setErro('');
    }
    setAberta(abrir);
  }

  async function excluir() {
    setErro('');
    setExcluindo(true);
    try {
      await deletarNotebook(notebook.id_notebook);
      toast.add({ type: 'success', description: 'Notebook excluído.' });
      avisar(NOTEBOOKS_ALTERADOS);
      setAberta(false);
    } catch (err) {
      setErro(err.message);
    } finally {
      setExcluindo(false);
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
            aria-label={`Excluir ${notebook.modelo}`}
          />
        }
      >
        <TrashIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir notebook?</DialogTitle>
          <DialogDescription>
            O notebook nº {notebook.id_notebook} ({notebook.modelo}) será excluído. Esta ação não
            pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          <Button variant="destructive" onClick={excluir} disabled={excluindo}>
            {excluindo ? 'Excluindo...' : 'Sim, excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
