import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserMinusIcon } from '@phosphor-icons/react';

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
import { atualizarAluno, emprestimosDoAluno } from '@/lib/api';
import { avisar, ALUNOS_ALTERADOS } from '@/lib/eventos';
import { formatarDataSemHora } from '../../remessas/remessas-textos';

// "Inativar" no lugar de "Excluir": o aluno some da lista, mas continua
// guardado com todo o histórico. Para reativar, usa-se o Editar.
// Aluno com notebook emprestado só pode ser inativado depois da devolução
// (a janela já avisa ao abrir, e a API confere de novo).
export default function InativarAlunoDialog({ aluno }) {
  const [aberta, setAberta] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  // undefined = conferindo; null = sem empréstimo em aberto; objeto = o empréstimo
  const [emprestimoAberto, setEmprestimoAberto] = useState(undefined);

  function abrirOuFechar(abrir) {
    if (abrir) {
      setErro('');
      setEmprestimoAberto(undefined);
      emprestimosDoAluno(aluno.rm_aluno)
        .then((lista) => setEmprestimoAberto(lista.find((e) => e.situacao !== 'DEVOLVIDO') ?? null))
        // Se a conferência falhar, deixa tentar: a API recusa se houver empréstimo.
        .catch(() => setEmprestimoAberto(null));
    }
    setAberta(abrir);
  }

  async function inativar() {
    setErro('');
    setSalvando(true);
    try {
      await atualizarAluno(aluno.rm_aluno, { status: 'INATIVO' });
      toast.add({
        type: 'success',
        description: `${aluno.nome_completo} foi inativado. Para ver os inativos, use “Mostrar inativos”.`,
      });
      avisar(ALUNOS_ALTERADOS);
      setAberta(false);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  const conferindo = emprestimoAberto === undefined;

  return (
    <Dialog open={aberta} onOpenChange={abrirOuFechar}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={`Inativar ${aluno.nome_completo}`} />
        }
      >
        <UserMinusIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inativar aluno?</DialogTitle>
          <DialogDescription>
            {aluno.nome_completo} (RM {aluno.rm_aluno}) sai da lista, mas continua guardado com
            todo o histórico. Para reativar, ligue “Mostrar inativos” e use o Editar.
          </DialogDescription>
        </DialogHeader>
        {conferindo && (
          <p className="text-sm text-muted-foreground">Conferindo empréstimos...</p>
        )}
        {emprestimoAberto && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Este aluno está com o notebook nº {emprestimoAberto.id_notebook} (
            {emprestimoAberto.notebook}), com devolução prevista para{' '}
            {formatarDataSemHora(emprestimoAberto.previsao_devolucao)}. Registre a devolução em{' '}
            <Link to="/emprestimos" className="font-medium underline">
              Empréstimos
            </Link>{' '}
            antes de inativar.
          </p>
        )}
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          <Button onClick={inativar} disabled={salvando || conferindo || Boolean(emprestimoAberto)}>
            {salvando ? 'Inativando...' : 'Sim, inativar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
