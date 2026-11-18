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
import { deletarAluno } from '@/lib/api';
import { avisar, ALUNOS_ALTERADOS } from '@/lib/eventos';

// Confirmação antes de excluir um aluno. Se ele já tiver empréstimos ou
// entregas de kit, a API recusa e a mensagem sugere marcá-lo como Inativo.
export default function ExcluirAlunoDialog({ aluno }) {
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
      await deletarAluno(aluno.rm_aluno);
      toast.add({ type: 'success', description: 'Aluno excluído.' });
      avisar(ALUNOS_ALTERADOS);
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
            aria-label={`Excluir ${aluno.nome_completo}`}
          />
        }
      >
        <TrashIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir aluno?</DialogTitle>
          <DialogDescription>
            {aluno.nome_completo} (RM {aluno.rm_aluno}) será excluído. Esta ação não pode ser
            desfeita.
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
