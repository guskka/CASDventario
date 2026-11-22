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
import { reativarNotebook } from '@/lib/api';
import { avisar, NOTEBOOKS_ALTERADOS } from '@/lib/eventos';
import { rotuloMotivo } from '../notebooks-textos';

// "Reativar": o notebook inativo volta a ficar Disponível.
// O motivo e a observação saem do notebook, mas continuam no histórico (Logs).
export default function ReativarNotebookDialog({ notebook }) {
  const [aberta, setAberta] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function abrirOuFechar(abrir) {
    if (abrir) setErro('');
    setAberta(abrir);
  }

  async function reativar() {
    setErro('');
    setSalvando(true);
    try {
      await reativarNotebook(notebook.id_notebook);
      toast.add({
        type: 'success',
        description: `Notebook nº ${notebook.id_notebook} reativado: está Disponível de novo.`,
      });
      avisar(NOTEBOOKS_ALTERADOS);
      setAberta(false);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={aberta} onOpenChange={abrirOuFechar}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Reativar notebook nº ${notebook.id_notebook}`}
          />
        }
      >
        <ArrowCounterClockwiseIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reativar notebook nº {notebook.id_notebook}?</DialogTitle>
          <DialogDescription>
            {notebook.modelo} volta a ficar Disponível e pode ser emprestado de novo.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border px-3 py-2 text-sm">
          <p>
            <span className="text-muted-foreground">Motivo da inativação:</span>{' '}
            {rotuloMotivo(notebook.motivo_inativacao)}
          </p>
          {notebook.observacao_inativacao && (
            <p className="break-words">
              <span className="text-muted-foreground">Observação:</span>{' '}
              {notebook.observacao_inativacao}
            </p>
          )}
        </div>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          <Button onClick={reativar} disabled={salvando}>
            {salvando ? 'Reativando...' : 'Sim, reativar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
