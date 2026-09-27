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

// Gera uma senha temporária simples. Numa versão futura, o ideal é enviar
// um convite por email pro novo admin definir a própria senha — por
// enquanto, isso resolve o cadastro sem travar no TCC.
function gerarSenhaTemporaria() {
  return `Temp${Math.floor(100000 + Math.random() * 900000)}!`;
}

export default function AddAdminDialog() {
  const ADM_ROLES = [
    { label: 'Administrador Básico', value: 'normalAdm' },
    { label: 'Administrador Mestre', value: 'masterAdm' },
  ];

  const [openDialog, setOpenDialog] = useState(false);
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  function limparFormulario() {
    setNome('');
    setSobrenome('');
    setEmail('');
    setCargo('');
    setErro('');
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      const senhaTemporaria = gerarSenhaTemporaria();

      await cadastrarUsuario({
        nome: `${nome} ${sobrenome}`.trim(),
        email,
        senha: senhaTemporaria,
        apelidos: nome,
        // O banco espera "padrao" ou "administrador" (tb_usuario_tipo_usuario).
        tipo: cargo === 'masterAdm' ? 'administrador' : 'padrao',
      });

      // TCC: mostra a senha temporária pra quem cadastrou repassar pro novo
      // admin. Numa versão real, isso viraria um email automático.
      alert(`Administrador criado! Senha temporária: ${senhaTemporaria}`);

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
            Preencha os campos para cadastro de um novo administrador.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {erro && (
              <p className="text-sm text-destructive">{erro}</p>
            )}
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="surname">
                  Sobrenome
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  required
                  id="surname"
                  value={sobrenome}
                  onChange={(e) => setSobrenome(e.target.value)}
                />
              </Field>
            </div>
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
