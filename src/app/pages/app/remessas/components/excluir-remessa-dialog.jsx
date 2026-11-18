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
import { deletarRemessa } from '@/lib/api';
import { avisar, REMESSAS_ALTERADAS } from '@/lib/eventos';
import { formatarDataSemHora } from '../remessas-textos';

// Confirmação antes de excluir uma remessa (e o estoque dela). A API recusa
// se algum material da remessa já foi entregue.
export default function ExcluirRemessaDialog({ remessa }) {
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
      await deletarRemessa(remessa.id_remessa);
      toast.add({ type: 'success', description: 'Remessa excluída.' });
      avisar(REMESSAS_ALTERADAS);
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
            aria-label={`Excluir remessa nº ${remessa.id_remessa}`}
          />
        }
      >
        <TrashIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir remessa?</DialogTitle>
          <DialogDescription>
            A remessa nº {remessa.id_remessa} de {formatarDataSemHora(remessa.data_recebimento)} e o
            estoque dos {remessa.itens.length} material(is) dela serão excluídos. Esta ação não pode
            ser desfeita.
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
