import { useState } from 'react';
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
import { atualizarUsuario } from '@/lib/api';
import { avisar, USUARIOS_ALTERADOS } from '@/lib/eventos';

// "Inativar" um administrador: perde o acesso na hora, mas a conta e o
// histórico continuam guardados. Para reativar, usa-se o Editar.
// Não aparece na linha da própria pessoa (ninguém inativa a si mesmo aqui).
export default function InativarAdminDialog({ user }) {
  const [aberta, setAberta] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const pendente = user.status === 'PENDENTE';

  function abrirOuFechar(abrir) {
    if (abrir) setErro('');
    setAberta(abrir);
  }

  async function inativar() {
    setErro('');
    setSalvando(true);
    try {
      await atualizarUsuario(user.id, { status: 'INATIVO' });
      toast.add({
        type: 'success',
        description: `${user.name} foi inativado. Para ver os inativos, use “Mostrar inativos”.`,
      });
      avisar(USUARIOS_ALTERADOS);
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
        render={<Button variant="ghost" size="icon" aria-label={`Inativar ${user.name}`} />}
      >
        <UserMinusIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inativar administrador?</DialogTitle>
          <DialogDescription>
            {pendente
              ? `${user.name} ainda não criou a senha. O convite enviado por email deixa de funcionar.`
              : `${user.name} perde o acesso ao sistema na hora.`}{' '}
            A conta e o histórico continuam guardados. Para reativar, ligue “Mostrar inativos” e
            use o Editar.
          </DialogDescription>
        </DialogHeader>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          <Button onClick={inativar} disabled={salvando}>
            {salvando ? 'Inativando...' : 'Sim, inativar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
