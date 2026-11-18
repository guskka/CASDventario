import { useState } from 'react';

import { PlusIcon } from '@phosphor-icons/react';

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
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectGroup,
} from '@/components/ui/select';
import { Field, FieldGroup } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cadastrarUsuario } from '@/lib/api';
import { avisar, USUARIOS_ALTERADOS } from '@/lib/eventos';
import { avisarResultadoConvite } from './avisar-convite';

export default function AddAdminDialog() {
  const ADM_ROLES = [
    { label: 'Administrador Básico', value: 'BASICO' },
    { label: 'Administrador Mestre', value: 'MESTRE' },
  ];

  const [openDialog, setOpenDialog] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  function limparFormulario() {
    setNome('');
    setEmail('');
    setCargo('');
    setErro('');
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro('');

    if (!cargo) {
      setErro('Selecione um cargo.');
      return;
    }

    setEnviando(true);

    try {
      // A conta nasce PENDENTE e a pessoa recebe um email para criar a
      // própria senha: ninguém (nem o Mestre) fica sabendo a senha dela.
      const novo = await cadastrarUsuario({
        nome: nome.trim(),
        email: email.trim(),
        tipo: cargo, // "BASICO" ou "MESTRE" (enum tb_usuario_tipo)
      });

      avisarResultadoConvite(novo.convite, novo.email);
      avisar(USUARIOS_ALTERADOS);

      limparFormulario();
      setOpenDialog(false);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={(open) => setOpenDialog(open)}>
      <DialogTrigger>
        <Button
          onClick={() => setOpenDialog(true)}
          variant="secondary"
          size="lg"
        >
          <PlusIcon />
          Adicionar Administrador
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Administrador</DialogTitle>
          <DialogDescription>
            Preencha os campos para cadastro de um novo administrador. Ele receberá um
            email com um link para criar a própria senha.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {erro && (
              <p className="text-sm text-destructive">{erro}</p>
            )}
              <Field>
                <Label htmlFor="name">
                  Nome
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  required
                  id="name"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </Field>
            <Field>
              <Label htmlFor="email">
                Email
                <span className="text-destructive">*</span>
              </Label>
              <Input
                required
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="role">
                Cargo
                <span className="text-destructive">*</span>
              </Label>
              <Select
                required
                id="role"
                items={ADM_ROLES}
                value={cargo}
                onValueChange={setCargo}
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
            <Button type="submit" variant="default" disabled={enviando}>
              {enviando ? 'Cadastrando...' : 'Cadastrar'}
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
