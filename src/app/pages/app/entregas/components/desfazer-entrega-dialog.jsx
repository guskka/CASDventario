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
import { desfazerEntrega } from '@/lib/api';
import { avisar, ENTREGAS_ALTERADAS } from '@/lib/eventos';

// Desfaz uma entrega registrada por engano: a quantidade volta para o estoque.
export default function DesfazerEntregaDialog({ entrega }) {
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
      await desfazerEntrega(entrega.id_entrega_kit);
      toast.add({
        type: 'success',
        description: `Entrega desfeita: ${entrega.qtd_entregue} voltaram para o estoque.`,
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
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            aria-label={`Desfazer entrega nº ${entrega.id_entrega_kit}`}
          />
        }
      >
        <ArrowCounterClockwiseIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desfazer entrega?</DialogTitle>
          <DialogDescription>
            A entrega de {entrega.descricao} será apagada e {entrega.qtd_entregue} voltará(ão) para
            o estoque. Use isto só para corrigir uma entrega registrada por engano.
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
