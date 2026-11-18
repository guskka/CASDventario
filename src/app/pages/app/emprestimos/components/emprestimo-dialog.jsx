import { useState } from 'react';
import { PlusIcon } from '@phosphor-icons/react';

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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import CampoSelect from '@/components/campo-select';
import BuscaAluno from '@/components/busca-aluno';
import { listarAlunos, listarEmprestimos, listarNotebooks, registrarEmprestimo } from '@/lib/api';
import { avisar, EMPRESTIMOS_ALTERADOS, NOTEBOOKS_ALTERADOS } from '@/lib/eventos';
import ChecklistCampos from './checklist-campos';
import { PRAZO_PADRAO_DIAS, checklistPadrao, hojeMaisDias } from '../emprestimos-textos';

// Janela "Novo Empréstimo": aluno + notebook disponível + previsão de
// devolução + checklist de saída (estado do notebook quando sai).
export default function EmprestimoDialog() {
  const [aberta, setAberta] = useState(false);
  const [alunos, setAlunos] = useState([]);
  const [notebooks, setNotebooks] = useState([]);
  const [aluno, setAluno] = useState(null);
  const [notebookId, setNotebookId] = useState(null);
  const [previsao, setPrevisao] = useState('');
  const [checklist, setChecklist] = useState(checklistPadrao());
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function abrirOuFechar(abrir) {
    if (abrir) {
      setAluno(null);
      setNotebookId(null);
      setPrevisao(hojeMaisDias(PRAZO_PADRAO_DIAS));
      setChecklist(checklistPadrao());
      setObservacoes('');
      setErro('');
      Promise.all([listarAlunos(), listarNotebooks('DISPONIVEL'), listarEmprestimos()])
        .then(([listaAlunos, disponiveis, emprestimos]) => {
          // Só alunos que podem pegar: não inativos e sem empréstimo em aberto.
          const comEmprestimo = new Set(
            emprestimos.filter((e) => e.situacao !== 'DEVOLVIDO').map((e) => e.rm_aluno),
          );
          setAlunos(
            listaAlunos.filter((a) => a.status !== 'INATIVO' && !comEmprestimo.has(a.rm_aluno)),
          );
          setNotebooks(disponiveis);
        })
        .catch((err) => setErro(err.message));
    }
    setAberta(abrir);
  }

  const opcoesNotebook = notebooks.map((nb) => ({
    value: String(nb.id_notebook),
    label: `nº ${nb.id_notebook} · ${nb.modelo} · ${nb.memoria_ram_gb} GB RAM · ${nb.armazenamento_gb} GB`,
  }));

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    if (!aluno) {
      setErro('Escolha o aluno.');
      return;
    }
    if (!notebookId) {
      setErro('Escolha o notebook.');
      return;
    }

    setSalvando(true);
    try {
      const emprestimo = await registrarEmprestimo({
        notebookId: Number(notebookId),
        alunoRm: aluno.rm_aluno,
        previsaoDevolucao: previsao,
        checklist: { ...checklist, observacoes: observacoes.trim() || null },
      });
      toast.add({
        type: 'success',
        description: `Empréstimo registrado: ${emprestimo.descricao}.`,
      });
      avisar(EMPRESTIMOS_ALTERADOS);
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
      <DialogTrigger render={<Button variant="secondary" size="lg" />}>
        <PlusIcon />
        Novo Empréstimo
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Empréstimo</DialogTitle>
          <DialogDescription>
            O notebook passa a constar como emprestado automaticamente. Confira o estado dele antes
            de entregar ao aluno.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {erro && <p className="text-sm text-destructive">{erro}</p>}

            <BuscaAluno id="emprestimo-aluno" alunos={alunos} aluno={aluno} onChange={setAluno} />

            {notebooks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Não há notebook disponível no momento.
              </p>
            ) : (
              <CampoSelect
                id="emprestimo-notebook"
                label="Notebook (disponíveis)"
                obrigatorio
                opcoes={opcoesNotebook}
                valor={notebookId}
                onChange={setNotebookId}
                placeholder="Selecione o notebook"
              />
            )}

            <Field>
              <Label htmlFor="emprestimo-previsao">
                Devolver até<span className="text-destructive">*</span>
              </Label>
              <Input
                id="emprestimo-previsao"
                type="date"
                required
                min={hojeMaisDias(0)}
                value={previsao}
                onChange={(e) => setPrevisao(e.target.value)}
              />
              <FieldDescription>
                Sugestão: {PRAZO_PADRAO_DIAS} dias a partir de hoje. Pode mudar.
              </FieldDescription>
            </Field>

            <div className="space-y-2">
              <h4 className="font-semibold">Checklist de saída</h4>
              <p className="text-sm text-muted-foreground">
                Como o notebook está saindo. Na devolução, o estado será comparado com este.
              </p>
              <ChecklistCampos
                prefixo="saida"
                valores={checklist}
                onChange={(chave, valor) => setChecklist((atual) => ({ ...atual, [chave]: valor }))}
                observacoes={observacoes}
                onObservacoes={setObservacoes}
              />
            </div>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={salvando || notebooks.length === 0}>
              {salvando ? 'Registrando...' : 'Registrar empréstimo'}
            </Button>
            <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
