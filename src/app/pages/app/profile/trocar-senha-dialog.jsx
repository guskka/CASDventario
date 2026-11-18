import { useState } from 'react';
import { CheckCircleIcon, CircleIcon } from '@phosphor-icons/react';

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
import { toast } from '@/components/ui/toast';
import { atualizarUsuario } from '@/lib/api';
import { REGRAS_SENHA, mensagemSenha } from '@/lib/senha';

// Janela "Mudar senha" do Perfil: pede a senha atual, a nova e a confirmação.
export default function TrocarSenhaDialog({ idUsuario }) {
  const [aberta, setAberta] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function abrirOuFechar(abrir) {
    if (abrir) {
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmacao('');
      setErro('');
    }
    setAberta(abrir);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    // A janela fica "dentro" do formulário do Perfil: sem isto, salvar a
    // senha também dispararia o "Salvar alterações" do Perfil.
    event.stopPropagation();
    setErro('');

    const problema = mensagemSenha(novaSenha);
    if (problema) {
      setErro(problema);
      return;
    }
    if (novaSenha !== confirmacao) {
      setErro('As duas senhas novas digitadas não são iguais.');
      return;
    }

    setSalvando(true);
    try {
      await atualizarUsuario(idUsuario, { senhaAtual, senha: novaSenha });
      toast.add({ type: 'success', description: 'Senha alterada com sucesso.' });
      setAberta(false);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={aberta} onOpenChange={abrirOuFechar}>
      <DialogTrigger render={<Button variant="secondary">Mudar senha</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mudar senha</DialogTitle>
          <DialogDescription>
            Para sua segurança, confirme a senha atual antes de escolher a nova.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {erro && <p className="text-sm text-destructive">{erro}</p>}
            <Field>
              <Label htmlFor="senha-atual">Senha atual</Label>
              <Input
                id="senha-atual"
                type="password"
                autoComplete="current-password"
                required
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="nova-senha">Nova senha</Label>
              <Input
                id="nova-senha"
                type="password"
                autoComplete="new-password"
                required
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
              />
              <ul className="space-y-1 text-sm">
                {REGRAS_SENHA.map((regra) => {
                  const ok = regra.ok(novaSenha);
                  return (
                    <li
                      key={regra.texto}
                      className={`flex items-center gap-2 ${ok ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      {ok ? <CheckCircleIcon weight="fill" /> : <CircleIcon />}
                      {regra.texto}
                    </li>
                  );
                })}
              </ul>
            </Field>
            <Field>
              <Label htmlFor="confirmar-nova-senha">Confirmar nova senha</Label>
              <Input
                id="confirmar-nova-senha"
                type="password"
                autoComplete="new-password"
                required
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
              />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar nova senha'}
            </Button>
            <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
