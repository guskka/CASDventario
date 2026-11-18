import { useState } from 'react';
import { CalendarPlusIcon } from '@phosphor-icons/react';

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
import { Field } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { alterarPrevisaoEmprestimo } from '@/lib/api';
import { avisar, EMPRESTIMOS_ALTERADOS } from '@/lib/eventos';
import { paraCampoData } from '../../remessas/remessas-textos';

// "Mais prazo": muda a data prevista de devolução de um empréstimo em aberto.
export default function PrazoDialog({ emprestimo }) {
  const [aberta, setAberta] = useState(false);
  const [previsao, setPrevisao] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function abrirOuFechar(abrir) {
    if (abrir) {
      setPrevisao(paraCampoData(emprestimo.previsao_devolucao));
      setErro('');
    }
    setAberta(abrir);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      await alterarPrevisaoEmprestimo(emprestimo.id_emprestimo_notebook, previsao);
      toast.add({ type: 'success', description: 'Prazo de devolução alterado.' });
      avisar(EMPRESTIMOS_ALTERADOS);
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
            aria-label={`Mais prazo para o empréstimo nº ${emprestimo.id_emprestimo_notebook}`}
          />
        }
      >
        <CalendarPlusIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar prazo de devolução</DialogTitle>
          <DialogDescription>{emprestimo.descricao}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <Field>
            <Label htmlFor="prazo-previsao">Devolver até</Label>
            <Input
              id="prazo-previsao"
              type="date"
              required
              value={previsao}
              onChange={(e) => setPrevisao(e.target.value)}
            />
          </Field>
          <DialogFooter>
            <Button type="submit" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </Button>
            <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
