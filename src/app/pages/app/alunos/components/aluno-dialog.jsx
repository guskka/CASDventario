import { useState } from 'react';
import { ArrowsClockwiseIcon, PencilSimpleIcon, PlusIcon } from '@phosphor-icons/react';

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import CampoSelect from '@/components/campo-select';
import { toast } from '@/components/ui/toast';
import { atualizarAluno, cadastrarAluno } from '@/lib/api';
import {
  dicaRm,
  DOMINIO_EMAIL_ALUNO,
  inicioEmailEsperado,
  inicioEmailValido,
  limparInicioEmail,
  limparRm,
  MENSAGEM_INICIO_EMAIL,
  MENSAGEM_RM,
  MENSAGEM_SOBRENOME,
  rmValido,
  separarEmailAluno,
  temSobrenome,
} from '@/lib/aluno';
import { avisar, ALUNOS_ALTERADOS } from '@/lib/eventos';
import { CURSOS, SEM_TURMA, STATUS_ALUNO, TURMAS } from '../alunos-textos';

const AVISO_AMARELO =
  'rounded-md bg-yellow-500/15 px-2.5 py-1.5 text-sm text-yellow-700 dark:text-yellow-400';

// Janela de cadastrar (sem "aluno") ou editar (com "aluno") um aluno.
// Mesmo modelo das janelas da tela de Administradores.
export default function AlunoDialog({ aluno }) {
  const editando = Boolean(aluno);

  const [aberta, setAberta] = useState(false);
  const [rm, setRm] = useState('');
  const [nome, setNome] = useState('');
  // Só a parte antes do @: o final do email é sempre o domínio institucional.
  const [inicioEmail, setInicioEmail] = useState('');
  // Edição de aluno antigo cujo email não é institucional: o email de antes.
  const [emailAntigo, setEmailAntigo] = useState(null);
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
      if (aluno) {
        // Email de outro domínio: já sugere o do padrão e avisa a troca.
        const salvo = separarEmailAluno(aluno.email);
        setInicioEmail(
          salvo.institucional
            ? salvo.inicio
            : inicioEmailEsperado(aluno.nome_completo, aluno.rm_aluno),
        );
        setEmailAntigo(salvo.institucional ? null : aluno.email);
      } else {
        setInicioEmail('');
        setEmailAntigo(null);
      }
      setCurso(aluno?.curso ?? null);
      setTurma(aluno?.turma ?? SEM_TURMA);
      setStatus(aluno?.status ?? 'ATIVO');
      setErro('');
    }
    setAberta(abrir);
  }

  // No cadastro, o email acompanha o nome e o RM enquanto a pessoa não mudar o
  // email à mão (ou se ela apagar o email). Na edição, o email não muda sozinho.
  function emailSegue() {
    return !editando && (inicioEmail === '' || inicioEmail === inicioEmailEsperado(nome, rm));
  }

  function mudarNome(novoNome) {
    if (emailSegue()) setInicioEmail(inicioEmailEsperado(novoNome, rm));
    setNome(novoNome);
  }

  function mudarRm(texto) {
    const novoRm = limparRm(texto);
    if (emailSegue()) setInicioEmail(inicioEmailEsperado(nome, novoRm));
    setRm(novoRm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    // O RM só é digitado no cadastro; na edição ele fica travado como está.
    if (!editando && !rmValido(rm)) {
      setErro(MENSAGEM_RM);
      return;
    }
    // Sobrenome: obrigatório para alunos novos (os antigos seguem editáveis).
    if (!editando && !temSobrenome(nome)) {
      setErro(MENSAGEM_SOBRENOME);
      return;
    }
    if (!inicioEmail) {
      setErro('Preencha o email (a parte antes do @).');
      return;
    }
    if (!inicioEmailValido(inicioEmail)) {
      setErro(MENSAGEM_INICIO_EMAIL);
      return;
    }
    if (!curso) {
      setErro('Selecione o curso.');
      return;
    }

    const dados = {
      nome: nome.trim(),
      email: `${inicioEmail}@${DOMINIO_EMAIL_ALUNO}`,
      curso,
      turma: turma === SEM_TURMA ? null : turma,
      status,
    };

    setSalvando(true);
    try {
      if (editando) {
        await atualizarAluno(aluno.rm_aluno, dados);
      } else {
        await cadastrarAluno({ rm: Number(rm), ...dados });
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

  const dica = editando ? null : dicaRm(rm);
  const inicioEsperado = inicioEmailEsperado(nome, editando ? aluno.rm_aluno : rm);

  // Botão "Refazer pelo padrão" (aparece no aviso amarelo). O aviso some depois
  // do clique, então o foco volta para o campo de email.
  function refazerPeloPadrao() {
    setInicioEmail(inicioEsperado);
    document.getElementById('aluno-email')?.focus();
  }
  const foraDoPadrao = Boolean(inicioEsperado && inicioEmail && inicioEmail !== inicioEsperado);
  const faltaSobrenome = !editando && nome.trim() !== '' && !temSobrenome(nome);
  const dicasEmail = ['aluno-email-dominio'];
  if (emailAntigo) dicasEmail.push('aluno-email-antigo');
  if (foraDoPadrao) dicasEmail.push('aluno-email-padrao');

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
      <DialogContent className="sm:max-w-lg">
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
                inputMode="numeric"
                autoComplete="off"
                required
                disabled={editando}
                value={rm}
                onChange={(e) => mudarRm(e.target.value)}
                aria-invalid={dica?.erro || undefined}
                aria-describedby={editando ? undefined : 'aluno-rm-dica'}
              />
              {!editando && (
                <FieldDescription
                  id="aluno-rm-dica"
                  className={dica.erro ? 'text-destructive' : undefined}
                >
                  {dica.texto}
                </FieldDescription>
              )}
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
                onChange={(e) => mudarNome(e.target.value)}
                aria-describedby={faltaSobrenome ? 'aluno-nome-dica' : undefined}
              />
              {faltaSobrenome && (
                <FieldDescription id="aluno-nome-dica">
                  Digite também o sobrenome: o email é montado com ele.
                </FieldDescription>
              )}
            </Field>
            <Field>
              <Label htmlFor="aluno-email">
                Email<span className="text-destructive">*</span>
              </Label>
              {/* flex-wrap: em tela estreita, o final do email desce para a linha de baixo */}
              <InputGroup className="h-auto min-h-8 flex-wrap">
                <InputGroupInput
                  id="aluno-email"
                  className="min-w-36"
                  autoComplete="off"
                  spellCheck={false}
                  required
                  value={inicioEmail}
                  onChange={(e) => setInicioEmail(limparInicioEmail(e.target.value))}
                  aria-describedby={dicasEmail.join(' ')}
                />
                <InputGroupAddon align="inline-end" className="pl-2.5">
                  <InputGroupText id="aluno-email-dominio">@{DOMINIO_EMAIL_ALUNO}</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {!editando && !foraDoPadrao && (
                <FieldDescription>
                  Montado sozinho com o nome e o RM. Dá para mudar a parte antes do @.
                </FieldDescription>
              )}
              {foraDoPadrao && (
                <div className={`${AVISO_AMARELO} flex flex-wrap items-center gap-x-3 gap-y-1.5`}>
                  <p id="aluno-email-padrao" className="min-w-0 flex-1 basis-56">
                    Fora do padrão. O esperado é{' '}
                    <strong className="font-medium break-all">
                      {inicioEsperado}@{DOMINIO_EMAIL_ALUNO}
                    </strong>
                    . Dá para salvar assim mesmo.
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={refazerPeloPadrao}>
                    <ArrowsClockwiseIcon />
                    Refazer pelo padrão
                  </Button>
                </div>
              )}
              {emailAntigo && (
                <p id="aluno-email-antigo" className={AVISO_AMARELO}>
                  O email atual, <strong className="font-medium break-all">{emailAntigo}</strong>,
                  não é institucional. Ao salvar, ele será trocado pelo email acima.
                </p>
              )}
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
