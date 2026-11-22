import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProhibitIcon } from '@phosphor-icons/react';

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
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import CampoSelect from '@/components/campo-select';
import { inativarNotebook } from '@/lib/api';
import { avisar, NOTEBOOKS_ALTERADOS } from '@/lib/eventos';
import { MOTIVOS_INATIVACAO } from '../notebooks-textos';

const OBSERVACAO_MAXIMA = 255;

// "Inativar" no lugar de "Excluir": o notebook sai de uso (some da lista e dos
// empréstimos), mas continua guardado com o histórico. Motivo obrigatório.
// Notebook emprestado só pode ser inativado depois da devolução.
export default function InativarNotebookDialog({ notebook }) {
  const emprestado = notebook.status === 'INDISPONIVEL';

  const [aberta, setAberta] = useState(false);
  const [motivo, setMotivo] = useState(null);
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function abrirOuFechar(abrir) {
    if (abrir) {
      setMotivo(null);
      setObservacao('');
      setErro('');
    }
    setAberta(abrir);
  }

  async function inativar(event) {
    event.preventDefault();
    setErro('');
    if (!motivo) {
      setErro('Escolha o motivo da inativação.');
      return;
    }
    setSalvando(true);
    try {
      await inativarNotebook(notebook.id_notebook, {
        motivo,
        observacao: observacao.trim() || null,
      });
      toast.add({
        type: 'success',
        description: `Notebook nº ${notebook.id_notebook} inativado. Para ver os inativos, use “Mostrar inativos”.`,
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
            aria-label={`Inativar notebook nº ${notebook.id_notebook}`}
          />
        }
      >
        <ProhibitIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inativar notebook nº {notebook.id_notebook}?</DialogTitle>
          <DialogDescription>
            {notebook.modelo} sai de uso: some da lista e não pode mais ser emprestado, mas
            continua guardado com todo o histórico. Para voltar a usar, ligue “Mostrar inativos” e
            clique em Reativar.
          </DialogDescription>
        </DialogHeader>
        {emprestado ? (
          <>
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Este notebook está emprestado. Registre a devolução em{' '}
              <Link to="/emprestimos" className="font-medium underline">
                Empréstimos
              </Link>{' '}
              antes de inativar.
            </p>
            <DialogFooter>
              <DialogClose render={<Button variant="outline">Fechar</Button>} />
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={inativar}>
            <FieldGroup>
              {erro && <p className="text-sm text-destructive">{erro}</p>}
              <CampoSelect
                id="nb-motivo"
                label="Motivo"
                obrigatorio
                opcoes={MOTIVOS_INATIVACAO}
                valor={motivo}
                onChange={(valor) => {
                  setMotivo(valor);
                  setErro('');
                }}
                placeholder="Selecione o motivo"
              />
              <Field>
                <Label htmlFor="nb-observacao">Observação</Label>
                <Textarea
                  id="nb-observacao"
                  maxLength={OBSERVACAO_MAXIMA}
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Opcional. Ex.: tela quebrada, conserto mais caro que um novo."
                />
                <FieldDescription>
                  {observacao.length}/{OBSERVACAO_MAXIMA} caracteres
                </FieldDescription>
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-4">
              <DialogClose render={<Button variant="outline">Cancelar</Button>} />
              <Button type="submit" disabled={salvando}>
                {salvando ? 'Inativando...' : 'Sim, inativar'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
