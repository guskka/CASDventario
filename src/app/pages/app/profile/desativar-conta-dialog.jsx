import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
import { atualizarUsuario, encerrarSessao } from '@/lib/api';

// Janela "Desativar minha conta" do Perfil. Pede a senha para confirmar;
// depois de desativar, encerra a sessão e volta para o login.
export default function DesativarContaDialog({ idUsuario }) {
  const navigate = useNavigate();
  const [aberta, setAberta] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  function abrirOuFechar(abrir) {
    if (abrir) {
      setSenhaAtual('');
      setErro('');
    }
    setAberta(abrir);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    setErro('');
    setEnviando(true);

    try {
      await atualizarUsuario(idUsuario, { status: 'INATIVO', senhaAtual });
      toast.add({
        type: 'success',
        description: 'Sua conta foi desativada. Para voltar, peça a reativação a um Mestre.',
      });
      encerrarSessao();
      navigate('/signin', { replace: true });
    } catch (err) {
      setErro(err.message);
      setEnviando(false);
    }
  }

  return (
    <Dialog open={aberta} onOpenChange={abrirOuFechar}>
      <DialogTrigger render={<Button variant="destructive">Desativar minha conta</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deseja realmente desativar sua conta?</DialogTitle>
          <DialogDescription>
            Esta ação encerrará sua sessão atual e bloqueará seu acesso ao sistema até que um
            Administrador Mestre realize a reativação.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <Field>
            <Label htmlFor="senha-desativar">Digite sua senha para confirmar</Label>
            <Input
              id="senha-desativar"
              type="password"
              autoComplete="current-password"
              required
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
            />
          </Field>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancelar</Button>} />
            <Button type="submit" variant="destructive" disabled={enviando}>
              {enviando ? 'Desativando...' : 'Sim, desativar conta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
