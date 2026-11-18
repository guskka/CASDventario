import { useState } from 'react';
import { PencilSimpleIcon, PlusIcon } from '@phosphor-icons/react';

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
import { Field, FieldGroup } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CampoSelect from '@/components/campo-select';
import { toast } from '@/components/ui/toast';
import { atualizarAluno, cadastrarAluno } from '@/lib/api';
import { avisar, ALUNOS_ALTERADOS } from '@/lib/eventos';
import { CURSOS, SEM_TURMA, STATUS_ALUNO, TURMAS } from '../alunos-textos';

const RM_MAXIMO = 4294967295; // maior número aceito pela coluna rm_aluno (INT UNSIGNED)

// Janela de cadastrar (sem "aluno") ou editar (com "aluno") um aluno.
// Mesmo modelo das janelas da tela de Administradores.
export default function AlunoDialog({ aluno }) {
  const editando = Boolean(aluno);

  const [aberta, setAberta] = useState(false);
  const [rm, setRm] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [curso, setCurso] = useState(null);
  const [turma, setTurma] = useState(SEM_TURMA);
  const [status, setStatus] = useState('ATIVO');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Toda vez que a janela abre, começa vazia (cadastro) ou com os dados do aluno (edição).
  function abrirOuFechar(abrir) {
    if (abrir) {
      setRm(aluno ? String(aluno.rm_aluno) : '');
      setNome(aluno?.nome_completo ?? '');
      setEmail(aluno?.email ?? '');
      setCurso(aluno?.curso ?? null);
      setTurma(aluno?.turma ?? SEM_TURMA);
      setStatus(aluno?.status ?? 'ATIVO');
      setErro('');
    }
    setAberta(abrir);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    const numeroRm = Number(rm);
    if (!Number.isInteger(numeroRm) || numeroRm < 1 || numeroRm > RM_MAXIMO) {
      setErro('Informe um RM válido (só números, maior que zero).');
      return;
    }
    if (!curso) {
      setErro('Selecione o curso.');
      return;
    }

    const dados = {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      curso,
      turma: turma === SEM_TURMA ? null : turma,
      status,
    };

    setSalvando(true);
    try {
      if (editando) {
        await atualizarAluno(aluno.rm_aluno, dados);
      } else {
        await cadastrarAluno({ rm: numeroRm, ...dados });
      }
      toast.add({
        type: 'success',
        description: editando ? 'Aluno editado com sucesso.' : 'Aluno cadastrado com sucesso.',
      });
      avisar(ALUNOS_ALTERADOS);
      setAberta(false);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={aberta} onOpenChange={abrirOuFechar}>
      {editando ? (
        <DialogTrigger
          render={<Button variant="ghost" size="icon" aria-label={`Editar ${aluno.nome_completo}`} />}
        >
          <PencilSimpleIcon />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button variant="secondary" size="lg" />}>
          <PlusIcon />
          Adicionar Aluno
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editando ? 'Editar Aluno' : 'Adicionar Aluno'}</DialogTitle>
          <DialogDescription>
            {editando
              ? 'O RM não pode ser alterado.'
              : 'Preencha os campos para cadastrar um novo aluno.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {erro && <p className="text-sm text-destructive">{erro}</p>}
            <Field>
              <Label htmlFor="aluno-rm">
                RM<span className="text-destructive">*</span>
              </Label>
              <Input
                id="aluno-rm"
                type="number"
                min="1"
                max={RM_MAXIMO}
                required
                disabled={editando}
                value={rm}
                onChange={(e) => setRm(e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="aluno-nome">
                Nome completo<span className="text-destructive">*</span>
              </Label>
              <Input
                id="aluno-nome"
                required
                maxLength={80}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="aluno-email">
                Email<span className="text-destructive">*</span>
              </Label>
              <Input
                id="aluno-email"
                type="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <CampoSelect
                id="aluno-curso"
                label="Curso"
                obrigatorio
                opcoes={CURSOS}
                valor={curso}
                onChange={setCurso}
                placeholder="Selecione"
              />
              <CampoSelect
                id="aluno-turma"
                label="Turma"
                opcoes={TURMAS}
                valor={turma}
                onChange={setTurma}
              />
              <CampoSelect
                id="aluno-status"
                label="Status"
                opcoes={STATUS_ALUNO}
                valor={status}
                onChange={setStatus}
              />
            </div>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={salvando}>
              {salvando ? 'Salvando...' : editando ? 'Salvar' : 'Cadastrar'}
            </Button>
            <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
