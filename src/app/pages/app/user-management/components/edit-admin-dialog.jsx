import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectGroup,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { PencilSimpleIcon } from '@phosphor-icons/react';
import { atualizarUsuario, usuarioLogado, atualizarSessao, reenviarConvite } from '@/lib/api';
import { avisar, USUARIOS_ALTERADOS } from '@/lib/eventos';
import { avisarResultadoConvite } from './avisar-convite';

const ADM_ROLES = [
  { label: 'Administrador Básico', value: 'BASICO' },
  { label: 'Administrador Mestre', value: 'MESTRE' },
];
const ADM_STATUS = [
  { label: 'Ativo', value: 'ATIVO' },
  { label: 'Inativo', value: 'INATIVO' },
];
// PENDENTE = conta que ainda não criou a senha. Só aparece para leitura:
// ela vira ATIVA quando a própria pessoa cria a senha (não pelo Mestre).
const STATUS_PENDENTE = { label: 'Pendente (aguardando criar a senha)', value: 'PENDENTE' };

export default function EditAdminDialog({ user }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [status, setStatus] = useState(user.status);
  const [role, setRole] = useState(user.role);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  const pendente = user.status === 'PENDENTE';
  const opcoesStatus = pendente ? [...ADM_STATUS, STATUS_PENDENTE] : ADM_STATUS;

  // A própria conta: cargo e status não podem ser mudados aqui
  // (evita que o único Mestre se rebaixe ou se inative sem querer).
  const ehVoceMesmo = usuarioLogado()?.id_usuario === user.id;

  // Toda vez que a janela abre, começa com os dados atuais da linha.
  function abrirOuFechar(aberta) {
    if (aberta) {
      setName(user.name);
      setUsername(user.username);
      setStatus(user.status);
      setRole(user.role);
      setErro('');
    }
    setOpenDialog(aberta);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro('');
    setSalvando(true);

    const dados = {
      nome: name.trim(),
      apelido: username.trim() || null,
    };
    if (!ehVoceMesmo) {
      dados.tipo = role;
      if (!pendente) {
        dados.status = status;
      }
    }

    try {
      await atualizarUsuario(user.id, dados);

      if (ehVoceMesmo) {
        atualizarSessao({ nome_completo: dados.nome, apelido: dados.apelido });
      }

      toast.add({
        type: 'success',
        description: 'Administrador editado com sucesso.',
      });
      avisar(USUARIOS_ALTERADOS);
      setOpenDialog(false);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  // Conta PENDENTE: manda um link novo para a pessoa criar a senha.
  async function handleReenviarConvite() {
    setErro('');
    setReenviando(true);
    try {
      const { convite } = await reenviarConvite(user.id);
      avisarResultadoConvite(convite, user.email);
    } catch (err) {
      setErro(err.message);
    } finally {
      setReenviando(false);
    }
  }

  return (
    <Dialog open={openDialog} onOpenChange={abrirOuFechar}>
      <DialogTrigger>
        <Button variant="ghost" size="icon" onClick={() => abrirOuFechar(true)}>
          <PencilSimpleIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          {ehVoceMesmo && (
            <DialogDescription>
              Esta é a sua conta: cargo e status não podem ser alterados por você.
            </DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {erro && <p className="text-sm text-destructive">{erro}</p>}
            <Field>
              <Label htmlFor="name">Nome</Label>
              <Input
                required
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="username">Apelido</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="status">Status</Label>
              <Select
                required
                id="status"
                items={opcoesStatus}
                value={status}
                onValueChange={setStatus}
                disabled={ehVoceMesmo || pendente}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {opcoesStatus.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {pendente && (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    Esta pessoa ainda não criou a senha pelo email de convite.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleReenviarConvite}
                    disabled={reenviando}
                  >
                    {reenviando ? 'Enviando...' : 'Reenviar convite'}
                  </Button>
                </div>
              )}
            </Field>
            <Field>
              <Label htmlFor="role">Cargo</Label>
              <Select
                required
                id="role"
                items={ADM_ROLES}
                value={role}
                onValueChange={setRole}
                disabled={ehVoceMesmo}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ADM_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" variant="default" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Editar'}
            </Button>
            <DialogClose>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
