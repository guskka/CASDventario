import { useState } from 'react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { desfazerEntrega } from '@/lib/api';
import { avisar, ENTREGAS_ALTERADAS } from '@/lib/eventos';

// Confirmação ao DESMARCAR um aluno na lista de entregas: apaga a entrega e a
// unidade volta para o estoque. Abre sozinha quando "aluno" não é null.
export default function DesfazerEntregaDialog({ aluno, nomeMaterial, onFechar }) {
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  function fechar() {
    setErro('');
    onFechar();
  }

  async function desfazer() {
    setErro('');
    setEnviando(true);
    try {
      await desfazerEntrega(aluno.entrega.id_entrega_kit);
      toast.add({
        type: 'success',
        description: `Entrega desfeita: 1 unidade de ${nomeMaterial} voltou para o estoque.`,
      });
      avisar(ENTREGAS_ALTERADAS);
      fechar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={Boolean(aluno)} onOpenChange={(abrir) => !abrir && fechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desfazer a entrega?</DialogTitle>
          <DialogDescription>
            <strong className="text-foreground">{aluno?.nome_completo}</strong> volta para
            Pendentes e 1 unidade de <strong className="text-foreground">{nomeMaterial}</strong>{' '}
            volta para o estoque.
          </DialogDescription>
        </DialogHeader>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          <Button variant="destructive" onClick={desfazer} disabled={enviando}>
            {enviando ? 'Desfazendo...' : 'Desfazer entrega'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
